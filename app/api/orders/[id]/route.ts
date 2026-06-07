import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const order = await Order.findById(id)
      .populate('items.product', 'title slug images type')
      .populate('customer', 'name email')
      .lean()

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isCustomer = (order.customer as any)._id?.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    const isDesigner =
      session.user.role === 'designer' &&
      (order.items as any[]).some((i) => i.designer?.toString() === session.user.id)

    if (!isCustomer && !isAdmin && !isDesigner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const body = await req.json()

    // Designers can only update trackingNumber and status (limited transitions)
    const allowedFields =
      session.user.role === 'admin'
        ? body
        : { trackingNumber: body.trackingNumber, status: body.status }

    const order = await Order.findByIdAndUpdate(id, allowedFields, { new: true })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
