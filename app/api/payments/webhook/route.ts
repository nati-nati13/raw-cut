import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    await connectDB()

    // Order is created on the client after successful payment; here we confirm it
    await Order.findOneAndUpdate(
      { paymentIntentId: intent.id },
      { status: 'paid' }
    )
  }

  return NextResponse.json({ received: true })
}

