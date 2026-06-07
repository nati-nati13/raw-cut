import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

const Schema = z.object({
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  currency: z.string().default('usd'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { subtotal, shippingCost, currency } = Schema.parse(body)

    const total = Math.round((subtotal + shippingCost) * 100) // cents

    const intent = await stripe.paymentIntents.create({
      amount: total,
      currency: currency.toLowerCase(),
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
    })

    return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
