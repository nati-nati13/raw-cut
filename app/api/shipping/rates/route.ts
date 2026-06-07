import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateShippingRates } from '@/lib/shipping'

const Schema = z.object({
  countryCode: z.string().length(2),
  weightGrams: z.number().min(0).default(500),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = Schema.parse(body)
    const rates = calculateShippingRates(data)
    return NextResponse.json(rates)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
