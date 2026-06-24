'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
}

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !id) return
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Order not found')
        return r.json()
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [status, id])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-gray-500">{error ?? 'Order not found.'}</p>
        <Button asChild variant="outline">
          <Link href="/account/orders">← My orders</Link>
        </Button>
      </div>
    )
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelledOrRefunded = ['cancelled', 'refunded'].includes(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/orders">
            <ArrowLeft className="h-4 w-4 mr-1" /> Orders
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {order.status}
        </span>
      </div>

      {/* Progress bar */}
      {!isCancelledOrRefunded && (
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-black' : 'bg-gray-200'}`}
              />
              {i < STATUS_STEPS.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="border rounded-lg p-4 text-sm space-y-1">
          <p className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" /> Tracking
          </p>
          <p className="text-gray-600">
            <span className="font-mono">{order.trackingNumber}</span> via {order.shippingCarrier}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="space-y-4">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item: any, i: number) => {
          const product = item.product
          return (
            <div key={i} className="flex gap-4">
              <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                {product?.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">✂</div>
                )}
              </div>
              <div className="flex-1">
                {product?.slug ? (
                  <Link href={`/products/${product.slug}`} className="font-medium text-sm hover:underline">
                    {product.title}
                  </Link>
                ) : (
                  <p className="font-medium text-sm">{product?.title ?? 'Product'}</p>
                )}
                {item.variant && (
                  <p className="text-xs text-gray-500">
                    {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">
                {order.currency} {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{order.currency} {order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping ({order.shippingCarrier})</span>
          <span>{order.currency} {order.shippingCost.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{order.currency} {order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Separator />

      {/* Shipping address */}
      <div className="space-y-1 text-sm">
        <h2 className="font-semibold">Shipping address</h2>
        <p className="text-gray-600">{order.shippingAddress?.street}</p>
        <p className="text-gray-600">
          {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
        </p>
        <p className="text-gray-600">{order.shippingAddress?.country}</p>
      </div>
    </div>
  )
}
