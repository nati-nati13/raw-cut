'use client'

import { useEffect, useState } from 'react'
import { IShippingRate } from '@/types'
import { Loader2 } from 'lucide-react'

interface ShippingSelectorProps {
  countryCode: string
  weightGrams: number
  selected: IShippingRate | null
  onSelect: (rate: IShippingRate) => void
}

export function ShippingSelector({ countryCode, weightGrams, selected, onSelect }: ShippingSelectorProps) {
  const [rates, setRates] = useState<IShippingRate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!countryCode || countryCode.length !== 2) return
    setLoading(true)
    fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode, weightGrams: weightGrams || 500 }),
    })
      .then((r) => r.json())
      .then((data) => {
        setRates(data)
        if (data.length > 0 && !selected) onSelect(data[0])
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, weightGrams])

  if (!countryCode) {
    return <p className="text-sm text-gray-400">Enter your country to see shipping options.</p>
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading rates…
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rates.map((rate) => (
        <label
          key={rate.carrier}
          className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
            selected?.carrier === rate.carrier
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="carrier"
              value={rate.carrier}
              checked={selected?.carrier === rate.carrier}
              onChange={() => onSelect(rate)}
              className="accent-black"
            />
            <div>
              <p className="text-sm font-medium">{rate.carrier}</p>
              <p className="text-xs text-gray-400">{rate.estimatedDays}</p>
            </div>
          </div>
          <p className="text-sm font-semibold">${rate.cost.toFixed(2)}</p>
        </label>
      ))}
    </div>
  )
}
