import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

// Next.js App Router reads the raw body correctly with req.text() — no special
// bodyParser config needed (that's a Pages Router concern).
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    // Return 400 so Stripe knows the delivery was rejected (it will retry).
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    await connectDB()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object
        // Update the order that was created by the client after confirmPayment().
        // If it doesn't exist yet (e.g. client crashed before POST /api/orders),
        // log it — the order creation must happen through the client flow because
        // the webhook doesn't have cart/shipping data. The intent metadata has
        // userId so a human or support tool can recover.
        const updated = await Order.findOneAndUpdate(
          { paymentIntentId: intent.id },
          { status: 'paid' },
          { new: true }
        )
        if (!updated) {
          // Not a webhook error — return 200 so Stripe stops retrying.
          // Log for manual recovery. In a full implementation this would
          // trigger a support alert or Slack notification.
          console.error(
            `[webhook] payment_intent.succeeded: no order found for intent ${intent.id}. ` +
            `userId=${intent.metadata?.userId} — manual recovery needed.`
          )
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object
        const failReason = intent.last_payment_error?.message ?? 'Unknown'
        console.warn(`[webhook] Payment failed for intent ${intent.id}: ${failReason}`)
        // Mark order as cancelled so it doesn't sit in pending forever.
        await Order.findOneAndUpdate(
          { paymentIntentId: intent.id, status: 'pending' },
          { status: 'cancelled' }
        )
        break
      }

      case 'payment_intent.canceled': {
        const intent = event.data.object
        await Order.findOneAndUpdate(
          { paymentIntentId: intent.id, status: 'pending' },
          { status: 'cancelled' }
        )
        break
      }

      default:
        // Unhandled event types — acknowledged but not processed.
        break
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    // Return 500 so Stripe retries the delivery.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  // Always acknowledge with 200 after successful processing.
  return NextResponse.json({ received: true })
}
