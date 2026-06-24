'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const order = searchParams.get('order')
    const paymentIntent = searchParams.get('payment_intent')
    const redirectStatus = searchParams.get('redirect_status')

    if (order) {
      // Direct success (no 3DS redirect)
      setOrderNumber(order)
      setLoading(false)
      return
    }

    if (paymentIntent && redirectStatus === 'succeeded') {
      // 3DS redirect path — recover pending order from sessionStorage
      const raw = sessionStorage.getItem('rc_pending_order')
      if (!raw) {
        setError('Order data not found. Check your email or contact support.')
        setLoading(false)
        return
      }

      const pending = JSON.parse(raw)

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pending.items.map((i: any) => ({
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
          paymentIntentId: paymentIntent,
        }),
      })
        .then((r) => r.json())
        .then((o) => {
          sessionStorage.removeItem('rc_pending_order')
          localStorage.removeItem('rawcut_cart')
          setOrderNumber(o.orderNumber ?? o._id)
        })
        .catch(() => setError('Could not record order — contact support with payment ID: ' + paymentIntent))
        .finally(() => setLoading(false))
      return
    }

    if (redirectStatus && redirectStatus !== 'succeeded') {
      setError('Payment was not completed. Please try again.')
      setLoading(false)
      return
    }

    // No params — redirect away
    router.replace('/')
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <p className="text-red-500 font-medium">{error}</p>
        <Button asChild variant="outline">
          <Link href="/">Return to shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-8">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Order confirmed!</h1>
        {orderNumber && (
          <p className="text-gray-500 text-sm">
            Order <span className="font-mono font-semibold text-black">{orderNumber}</span>
          </p>
        )}
        <p className="text-gray-500 text-sm">
          We&apos;ll send you a confirmation shortly. You can track your order in your account.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/account/orders">
            <Package className="h-4 w-4 mr-2" />
            View my orders
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
