'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
}

interface OrderItem {
  product: { _id: string; title: string; slug: string; images: string[] } | null
  quantity: number
  price: number
  variant?: { size?: string; color?: string }
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  items: OrderItem[]
  createdAt: string
  shippingCarrier: string
  trackingNumber?: string
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/account/orders')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/orders')
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My orders</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/account">← Account</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center text-gray-400 space-y-4">
          <Package className="h-12 w-12 mx-auto opacity-40" />
          <p>No orders yet.</p>
          <Button asChild variant="outline">
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block border rounded-lg p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold">
                    {order.currency} {order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Item thumbnails */}
              <div className="flex gap-2 flex-wrap">
                {order.items.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="relative w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0"
                  >
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title ?? ''}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">✂</div>
                    )}
                    {item.quantity > 1 && (
                      <span className="absolute bottom-0 right-0 bg-black text-white text-[10px] px-1">×{item.quantity}</span>
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              {order.trackingNumber && (
                <p className="text-xs text-gray-500 mt-2">
                  Tracking: <span className="font-mono">{order.trackingNumber}</span> via {order.shippingCarrier}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
