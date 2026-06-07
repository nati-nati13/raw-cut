'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { ShippingSelector } from '@/components/checkout/ShippingSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { IShippingRate } from '@/types'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = typeof window !== 'undefined'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : null

const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US',
  'Georgia': 'GE',
  'Germany': 'DE',
  'France': 'FR',
  'United Kingdom': 'GB',
  'Turkey': 'TR',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'Italy': 'IT',
  'Spain': 'ES',
}

export default function CheckoutPage() {
  const { items, subtotal, totalWeight, clearCart } = useCart()
  const router = useRouter()
  const [selectedRate, setSelectedRate] = useState<IShippingRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [country, setCountry] = useState('')

  const countryCode = COUNTRY_CODES[country] ?? country.toUpperCase().slice(0, 2)
  const total = subtotal + (selectedRate?.cost ?? 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedRate) {
      toast.error('Select a shipping method')
      return
    }
    setLoading(true)

    const form = new FormData(e.currentTarget)

    try {
      // 1. Create payment intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal, shippingCost: selectedRate.cost }),
      })
      const { clientSecret, paymentIntentId } = await intentRes.json()
      if (!clientSecret) throw new Error('Payment setup failed')

      // 2. Confirm payment with Stripe
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: { token: 'tok_visa' }, // Replace with Stripe Elements in production
          billing_details: {
            name: form.get('name') as string,
            email: form.get('email') as string,
          },
        },
      })
      if (error) throw new Error(error.message)

      // 3. Create order in DB
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            product: i.productId,
            designer: i.designerId,
            quantity: i.quantity,
            price: i.price,
            variant: i.variant,
            type: i.type,
          })),
          shippingAddress: {
            street: form.get('street'),
            city: form.get('city'),
            country: form.get('country'),
            postalCode: form.get('postalCode'),
          },
          shippingCarrier: selectedRate.carrier,
          shippingCost: selectedRate.cost,
          paymentIntentId,
        }),
      })

      clearCart()
      toast.success('Order placed!')
      router.push('/orders/success')
    } catch (err: any) {
      toast.error(err.message ?? 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) router.push('/cart')
  }, [items.length, router])

  if (items.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — address + shipping */}
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Shipping address</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="street">Street address</Label>
                  <Input id="street" name="street" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input id="postalCode" name="postalCode" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="e.g. United States, Georgia"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Shipping method</h2>
              <ShippingSelector
                countryCode={countryCode}
                weightGrams={totalWeight}
                selected={selectedRate}
                onSelect={setSelectedRate}
              />
            </div>
          </div>

          {/* Right — order summary */}
          <div>
            <div className="border rounded-lg p-5 space-y-4 sticky top-24">
              <h2 className="font-semibold">Order summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                      {item.title} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping ({selectedRate?.carrier ?? '—'})</span>
                <span>{selectedRate ? `$${selectedRate.cost.toFixed(2)}` : '—'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedRate}>
                {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
              </Button>
              <p className="text-xs text-center text-gray-400">
                Payments secured by Stripe
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
