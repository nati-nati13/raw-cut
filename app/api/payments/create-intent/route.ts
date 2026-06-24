import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

const Schema = z.object({
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  currency: z.string().default('usd'),
})

const MIN_CHARGE_USD = 0.50 // Stripe minimum

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { subtotal, shippingCost, currency } = Schema.parse(body)

    const total = Math.round((subtotal + shippingCost) * 100) // convert to cents

    if (total < Math.round(MIN_CHARGE_USD * 100)) {
      return NextResponse.json(
        { error: `Minimum order amount is $${MIN_CHARGE_USD.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Idempotency key: same user + same amount within the same minute cannot create
    // two separate intents (prevents double-click race). Minute window is wide enough
    // that a legitimately new checkout (different cart) gets a fresh intent.
    const minuteBucket = Math.floor(Date.now() / 60_000)
    const idempotencyKey = `pi_${session.user.id}_${total}_${currency}_${minuteBucket}`

    const intent = await stripe.paymentIntents.create(
      {
        amount: total,
        currency: currency.toLowerCase(),
        // automatic_payment_methods enables Apple Pay, Google Pay, Link, etc.
        // configured in the Stripe Dashboard — no code changes needed per method.
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: session.user.id,
          userEmail: session.user.email ?? '',
        },
      },
      { idempotencyKey }
    )

    return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[create-intent]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
