import { IShippingRate } from '@/types'

// Destination zones for flat-rate calculation
const ZONE_MAP: Record<string, number> = {
  GE: 0, // Georgia domestic
  US: 2,
  GB: 2,
  DE: 2,
  FR: 2,
  IT: 2,
  ES: 2,
  TR: 1,
  AZ: 1,
  AM: 1,
  RU: 1,
}

function getZone(countryCode: string): number {
  return ZONE_MAP[countryCode.toUpperCase()] ?? 3
}

interface ShippingInput {
  countryCode: string
  weightGrams: number
}

export function calculateShippingRates(input: ShippingInput): IShippingRate[] {
  const zone = getZone(input.countryCode)
  const weightKg = input.weightGrams / 1000

  const rates: IShippingRate[] = []

  // Georgian Post
  if (zone === 0) {
    rates.push({ carrier: 'Georgian Post', cost: 3.5, estimatedDays: '3–5 business days' })
  } else {
    const base = zone === 1 ? 8 : zone === 2 ? 14 : 20
    const perKg = zone === 1 ? 4 : zone === 2 ? 7 : 10
    rates.push({
      carrier: 'Georgian Post',
      cost: parseFloat((base + perKg * Math.max(weightKg, 0.1)).toFixed(2)),
      estimatedDays: zone <= 1 ? '7–14 business days' : '14–21 business days',
    })
  }

  // DHL
  const dhlBase = [5, 18, 30, 45][zone]
  const dhlPerKg = [2, 8, 15, 22][zone]
  rates.push({
    carrier: 'DHL',
    cost: parseFloat((dhlBase + dhlPerKg * Math.max(weightKg, 0.5)).toFixed(2)),
    estimatedDays: zone === 0 ? '1–2 business days' : zone <= 2 ? '3–5 business days' : '5–7 business days',
  })

  // FedEx
  const fedexBase = [6, 22, 35, 50][zone]
  const fedexPerKg = [2.5, 9, 16, 24][zone]
  rates.push({
    carrier: 'FedEx',
    cost: parseFloat((fedexBase + fedexPerKg * Math.max(weightKg, 0.5)).toFixed(2)),
    estimatedDays: zone === 0 ? '1 business day' : zone <= 2 ? '2–4 business days' : '4–6 business days',
  })

  return rates.sort((a, b) => a.cost - b.cost)
}
