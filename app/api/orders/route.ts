import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { sendOrderConfirmation } from '@/lib/email'

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().positive(),
      variant: z.object({ size: z.string().optional(), color: z.string().optional() }).optional(),
    })
  ).min(1),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  paymentIntentId: z.string().startsWith('pi_'),
})

function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `RC-${y}${m}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = CreateOrderSchema.parse(body)

    // ── 1. Verify PaymentIntent with Stripe ────────────────────────────────
    // Retrieve the intent directly from Stripe — do NOT trust client amounts.
    const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId)

    // Confirm the intent belongs to this user (stored in metadata by create-intent)
    if (intent.metadata?.userId && intent.metadata.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Read server-computed amounts from intent metadata
    const subtotal = parseFloat(intent.metadata?.serverSubtotal ?? '0')
    const shippingCost = parseFloat(intent.metadata?.serverShippingCost ?? '0')
    const totalAmount = parseFloat((subtotal + shippingCost).toFixed(2))
    const shippingCarrier = intent.metadata?.carrier ?? ''
    const currency = intent.metadata?.currency ?? 'USD'

    // ── 2. Idempotency — return existing order if already created ──────────
    await connectDB()
    const existingOrder = await Order.findOne({ paymentIntentId: data.paymentIntentId })
    if (existingOrder) return NextResponse.json(existingOrder)

    // ── 3. Fetch canonical product data from DB ────────────────────────────
    const productIds = data.items.map((i) => i.product)
    const dbProducts = await Product.find({
      _id: { $in: productIds },
    })
      .select('price designer type title')
      .lean()

    const productMap = new Map(dbProducts.map((p: any) => [p._id.toString(), p]))

    for (const item of data.items) {
      if (!productMap.has(item.product)) {
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 400 }
        )
      }
    }

    // ── 4. Build order items from DB data (no client prices) ──────────────
    const orderItems = data.items.map((item) => {
      const p = productMap.get(item.product) as any
      return {
        product: item.product,
        designer: p.designer,
        quantity: item.quantity,
        price: p.price,
        variant: item.variant,
        type: p.type,
      }
    })

    // ── 5. Commissions ─────────────────────────────────────────────────────
    const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE ?? 15)
    const platformFee = parseFloat((subtotal * (commissionRate / 100)).toFixed(2))
    const designerEarnings = parseFloat((subtotal - platformFee).toFixed(2))

    // ── 6. Create order — catch duplicate key to handle concurrent requests ──
    let order
    try {
      order = await Order.create({
        orderNumber: generateOrderNumber(),
        customer: session.user.id,
        items: orderItems,
        shippingAddress: data.shippingAddress,
        shippingCarrier,
        shippingCost,
        paymentIntentId: data.paymentIntentId,
        subtotal,
        platformFee,
        designerEarnings,
        totalAmount,
        currency,
        status: 'paid',
      })
    } catch (err: any) {
      if (err.code === 11000) {
        // Race: another request already created this order — return it
        const dup = await Order.findOne({ paymentIntentId: data.paymentIntentId })
        if (dup) return NextResponse.json(dup)
      }
      throw err
    }

    // ── 7. Confirmation email (fire-and-forget) ────────────────────────────
    const customer = await User.findById(session.user.id).select('email name').lean()
    if (customer) {
      const c = customer as any
      sendOrderConfirmation(c.email, c.name, {
        orderNumber: order.orderNumber,
        items: orderItems.map((i) => ({
          title: (productMap.get(i.product.toString()) as any)?.title ?? i.product,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        shippingCost,
        totalAmount,
        currency,
        shippingAddress: data.shippingAddress,
      }).catch(console.error)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[orders POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const query =
      session.user.role === 'admin' ? {} : { customer: session.user.id }

    const orders = await Order.find(query)
      .populate('items.product', 'title slug images')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
