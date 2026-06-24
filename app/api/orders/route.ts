import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import User from '@/models/User'
import { sendOrderConfirmation } from '@/lib/email'

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      designer: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      variant: z.object({ size: z.string().optional(), color: z.string().optional() }).optional(),
      type: z.enum(['physical', 'digital']),
    })
  ),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  shippingCarrier: z.string(),
  shippingCost: z.number().min(0),
  paymentIntentId: z.string(),
  currency: z.string().default('USD'),
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

    await connectDB()

    // Get commission rate from the first designer (simplification for MVP; multi-designer handled per item)
    const designer = await User.findById(data.items[0].designer)
    const commissionRate = designer?.commissionRate ?? Number(process.env.PLATFORM_COMMISSION_RATE ?? 15)

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const platformFee = parseFloat((subtotal * (commissionRate / 100)).toFixed(2))
    const designerEarnings = parseFloat((subtotal - platformFee).toFixed(2))
    const totalAmount = parseFloat((subtotal + data.shippingCost).toFixed(2))

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: session.user.id,
      ...data,
      subtotal,
      platformFee,
      designerEarnings,
      totalAmount,
      status: 'pending',
    })

    // Fire-and-forget order confirmation email
    const customer = await User.findById(session.user.id).select('email name').lean()
    if (customer) {
      const c = customer as any
      sendOrderConfirmation(c.email, c.name, {
        orderNumber: order.orderNumber,
        items: data.items.map((i) => ({ title: i.product, quantity: i.quantity, price: i.price })),
        subtotal,
        shippingCost: data.shippingCost,
        totalAmount,
        currency: data.currency ?? 'USD',
        shippingAddress: data.shippingAddress,
      }).catch(console.error)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(err)
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
