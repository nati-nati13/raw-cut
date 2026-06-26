'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Package, CreditCard, Loader2, Trash2, ChevronRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
}

const CARD_BRAND_LABEL: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  jcb: 'JCB',
  unionpay: 'UnionPay',
  diners: 'Diners Club',
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  items: { product: { images: string[]; title: string } | null; quantity: number }[]
  createdAt: string
}

interface SavedCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export default function AccountPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [cards, setCards] = useState<SavedCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [removingCard, setRemovingCard] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/account')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/account/payment-methods')
      .then((r) => r.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]))
      .finally(() => setCardsLoading(false))
  }, [status])

  if (status === 'loading' || !session) return null

  const user = session.user
  const initials = user.name?.slice(0, 2).toUpperCase() ?? '??'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      await update({ name })
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeCard(cardId: string) {
    setRemovingCard(cardId)
    try {
      const res = await fetch('/api/account/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: cardId }),
      })
      if (!res.ok) throw new Error('Failed to remove card')
      setCards((prev) => prev.filter((c) => c.id !== cardId))
      toast.success('Card removed')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRemovingCard(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? ''} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      <Separator />

      {/* Recent orders */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="text-xs text-gray-400 hover:text-black flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="border rounded-lg p-6 text-center space-y-3">
            <Package className="h-8 w-8 mx-auto text-gray-300" />
            <p className="text-sm text-gray-400">No orders yet.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Thumbnails */}
                <div className="flex gap-1 shrink-0">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title ?? ''}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">✂</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500">
                    {order.currency} {order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Saved payment methods */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <h2 className="font-semibold">Saved payment methods</h2>
        </div>

        {cardsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading cards…
          </div>
        ) : cards.length === 0 ? (
          <div className="border rounded-lg p-5 text-center">
            <p className="text-sm text-gray-400">No saved cards. Cards are saved when you check out.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {CARD_BRAND_LABEL[card.brand] ?? card.brand} ···· {card.last4}
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCard(card.id)}
                  disabled={removingCard === card.id}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 p-1"
                  aria-label="Remove card"
                >
                  {removingCard === card.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Edit profile */}
      <section className="space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user.email} disabled className="text-gray-400" />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </section>

      <Separator />

      {/* Sign out */}
      <section className="space-y-3">
        <h2 className="font-semibold text-red-600">Sign out</h2>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out of all devices
        </Button>
      </section>
    </div>
  )
}
