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
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Guard: loadStripe throws if key is undefined — only call in browser with real key.
const stripePromise =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null

const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US', 'Georgia': 'GE', 'Germany': 'DE',
  'France': 'FR', 'United Kingdom': 'GB', 'Turkey': 'TR',
  'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Italy': 'IT', 'Spain': 'ES',
}

interface PendingOrder {
  items: ReturnType<typeof useCart>['items']
  address: { name: string; email: string; street: string; city: string; postalCode: string; country: string }
  rate: IShippingRate
  paymentIntentId: string
}

// ─── Payment step (mounted inside <Elements>) ──────────────────────────────
function PaymentStep({
  pending,
  total,
  onSuccess,
}: {
  pending: PendingOrder
  total: number
  onSuccess: (orderId: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    // Save pending order in sessionStorage for redirect-based 3DS recovery
    sessionStorage.setItem('rc_pending_order', JSON.stringify(pending))

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/orders/success`,
        payment_method_data: {
          billing_details: { name: pending.address.name, email: pending.address.email },
        },
      },
    })

    if (error) {
      toast.error(error.message ?? 'Payment failed')
      setLoading(false)
      return
    }

    // Payment succeeded without redirect — create order
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pending.items.map((i) => ({
            product: i.productId,
            designer: i.designerId,
            quantity: i.quantity,
            price: i.price,
            variant: i.variant,
            type: i.type,
          })),
          shippingAddress: {
            street: pending.address.street,
            city: pending.address.city,
            country: pending.address.country,
            postalCode: pending.address.postalCode,
          },
          shippingCarrier: pending.rate.carrier,
          shippingCost: pending.rate.cost,
          paymentIntentId: paymentIntent!.id,
        }),
      })
      const order = await res.json()
      sessionStorage.removeItem('rc_pending_order')
      onSuccess(order.orderNumber ?? order._id)
    } catch {
      toast.error('Order could not be recorded — contact support with your payment ID')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="border rounded-lg p-5">
        <h2 className="font-semibold mb-4">Card details</h2>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { name: 'never', email: 'never' } },
          }}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading || !stripe}>
        {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </Button>
      <p className="text-xs text-center text-gray-400">Payments secured by Stripe</p>
    </form>
  )
}

// ─── Main checkout page ────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, totalWeight, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [selectedRate, setSelectedRate] = useState<IShippingRate | null>(null)
  const [country, setCountry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const countryCode = COUNTRY_CODES[country] ?? (country.length >= 2 ? country.toUpperCase().slice(0, 2) : '')
  const total = subtotal + (selectedRate?.cost ?? 0)

  useEffect(() => {
    if (items.length === 0 && step === 'address') router.push('/cart')
  }, [items.length, step, router])

  if (items.length === 0 && step === 'address') return null

  async function handleAddressSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedRate) { toast.error('Select a shipping method'); return }
    setSubmitting(true)

    const form = new FormData(e.currentTarget)
    const address = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      street: form.get('street') as string,
      city: form.get('city') as string,
      postalCode: form.get('postalCode') as string,
      country: form.get('country') as string,
    }

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal, shippingCost: selectedRate.cost }),
      })
      const data = await res.json()
      if (!data.clientSecret) throw new Error('Payment setup failed')

      setPending({ items, address, rate: selectedRate, paymentIntentId: data.paymentIntentId })
      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err: any) {
      toast.error(err.message ?? 'Could not start payment')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePaymentSuccess(orderNumber: string) {
    clearCart()
    router.push(`/orders/success?order=${encodeURIComponent(orderNumber)}`)
  }

  // Order summary sidebar (shared between steps)
  const orderSummary = (
    <div className="border rounded-lg p-5 space-y-4 sticky top-24">
      <h2 className="font-semibold">Order summary</h2>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variant?.size}-${item.variant?.color}`} className="flex justify-between text-sm">
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
        <span>Shipping {selectedRate ? `(${selectedRate.carrier})` : ''}</span>
        <span>{selectedRate ? `$${selectedRate.cost.toFixed(2)}` : '—'}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={step === 'address' ? 'font-semibold' : 'text-gray-400'}>1. Delivery</span>
        <span className="text-gray-300">›</span>
        <span className={step === 'payment' ? 'font-semibold' : 'text-gray-400'}>2. Payment</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left */}
        <div>
          {step === 'address' ? (
            <form onSubmit={handleAddressSubmit} className="space-y-8">
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

              <Button type="submit" className="w-full" size="lg" disabled={submitting || !selectedRate}>
                {submitting ? 'Setting up payment…' : 'Continue to payment'}
              </Button>
            </form>
          ) : (
            pending && clientSecret && (
              <div className="space-y-4">
                {/* Delivery summary */}
                <div className="border rounded-lg p-4 text-sm space-y-1 bg-gray-50">
                  <p className="font-medium">{pending.address.name}</p>
                  <p className="text-gray-500">{pending.address.street}, {pending.address.city} {pending.address.postalCode}, {pending.address.country}</p>
                  <p className="text-gray-500">{pending.rate.carrier} — ${pending.rate.cost.toFixed(2)}</p>
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="text-xs underline text-gray-400 mt-1"
                  >
                    Change
                  </button>
                </div>
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { theme: 'stripe' } }}
                >
                  <PaymentStep
                    pending={pending}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )
          )}
        </div>

        {/* Right — order summary */}
        <div>{orderSummary}</div>
      </div>
    </div>
  )
}
