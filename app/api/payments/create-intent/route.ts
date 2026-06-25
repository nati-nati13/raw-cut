import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { calculateShippingRates } from '@/lib/shipping'
import { checkPaymentRateLimit } from '@/lib/ratelimit'

const Schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().max(100),
        variant: z
          .object({ size: z.string().optional(), color: z.string().optional() })
          .optional(),
      })
    )
    .min(1),
  countryCode: z.string().min(2).max(3),
  carrier: z.string(),
  currency: z.string().default('usd'),
})

const MIN_CHARGE_CENTS = 50 // $0.50 USD — Stripe hard minimum

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await checkPaymentRateLimit(session.user.id)
    if (limited) return limited

    const body = await req.json()
    const { items, countryCode, carrier, currency } = Schema.parse(body)

    // ── 1. Fetch canonical prices from DB ─────────────────────────────────
    await connectDB()
    const productIds = items.map((i) => i.productId)
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      status: 'published',
    })
      .select('price weight designer type')
      .lean()

    if (dbProducts.length !== productIds.length) {
      const foundIds = new Set(dbProducts.map((p: any) => p._id.toString()))
      const missing = productIds.filter((id) => !foundIds.has(id))
      return NextResponse.json(
        { error: `Products unavailable: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // ── 2. Server-computed subtotal ────────────────────────────────────────
    const subtotal = items.reduce((sum, item) => {
      const p = dbProducts.find((p: any) => p._id.toString() === item.productId) as any
      return sum + p.price * item.quantity
    }, 0)

    // ── 3. Server-computed shipping ────────────────────────────────────────
    const totalWeightGrams = items.reduce((sum, item) => {
      const p = dbProducts.find((p: any) => p._id.toString() === item.productId) as any
      return sum + (p.weight ?? 500) * item.quantity
    }, 0)

    const rates = calculateShippingRates({ countryCode, weightGrams: totalWeightGrams })
    const selectedRate = rates.find((r) => r.carrier === carrier)
    if (!selectedRate) {
      return NextResponse.json(
        { error: `Carrier "${carrier}" not available for ${countryCode}` },
        { status: 400 }
      )
    }
    const shippingCost = selectedRate.cost

    // ── 4. Final total ─────────────────────────────────────────────────────
    const totalCents = Math.round((subtotal + shippingCost) * 100)
    if (totalCents < MIN_CHARGE_CENTS) {
      return NextResponse.json(
        { error: 'Order total is below the minimum charge amount ($0.50)' },
        { status: 400 }
      )
    }

    // ── 5. Create PaymentIntent ────────────────────────────────────────────
    // Idempotency: same user + same cart + same destination → same key → Stripe deduplicates.
    // Sort items so key is stable regardless of array order on client.
    const sortedItems = [...items].sort((a, b) =>
      a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : a.quantity - b.quantity
    )
    const idempotencyKey = createHash('sha256')
      .update(JSON.stringify({ userId: session.user.id, items: sortedItems, countryCode, carrier, currency }))
      .digest('hex')
      .slice(0, 40)

    const intent = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        // Store server-computed amounts in metadata.
        // The orders route reads these back after verifying payment —
        // no client-supplied numbers are ever trusted for financial calculations.
        metadata: {
          userId: session.user.id,
          userEmail: session.user.email ?? '',
          serverSubtotal: subtotal.toFixed(2),
          serverShippingCost: shippingCost.toFixed(2),
          serverTotal: (subtotal + shippingCost).toFixed(2),
          carrier,
          countryCode,
          currency: currency.toUpperCase(),
        },
      },
      { idempotencyKey }
    )

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      // Return server-computed values so the UI shows the correct total
      serverSubtotal: subtotal,
      serverShippingCost: shippingCost,
      serverTotal: subtotal + shippingCost,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[create-intent]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
