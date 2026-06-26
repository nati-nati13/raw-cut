'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/useCart'
import { Minus, Plus, Trash2 } from 'lucide-react'

export default function CartPage() {
  const { items, hydrated, removeItem, updateQuantity, subtotal } = useCart()

  if (!hydrated) return null

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-lg mb-6">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variant?.size}-${item.variant?.color}`} className="flex gap-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">✂</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-gray-400">{item.designerName}</p>
                {item.variant && (
                  <p className="text-xs text-gray-400">
                    {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                    className="h-6 w-6 rounded border flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                    className="h-6 w-6 rounded border flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.productId, item.variant)}
                  className="mt-2 text-gray-300 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">Order summary</h2>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
