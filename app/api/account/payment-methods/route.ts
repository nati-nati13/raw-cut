import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  await connectDB()
  const user = await User.findById(userId).select('stripeCustomerId email name').lean() as any
  if (user?.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id })
  return customer.id
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const customerId = await getOrCreateStripeCustomer(session.user.id, session.user.email)
    const { data: paymentMethods } = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    const cards = paymentMethods.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'card',
      last4: pm.card?.last4 ?? '????',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
    }))

    return NextResponse.json({ cards })
  } catch (err) {
    console.error('[payment-methods GET]', err)
    return NextResponse.json({ cards: [] })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentMethodId } = await req.json()
    if (!paymentMethodId) return NextResponse.json({ error: 'Missing paymentMethodId' }, { status: 400 })

    // Verify this PM belongs to this customer before detaching
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
    const customerId = await getOrCreateStripeCustomer(session.user.id, session.user.email)
    if (pm.customer !== customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await stripe.paymentMethods.detach(paymentMethodId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[payment-methods DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
