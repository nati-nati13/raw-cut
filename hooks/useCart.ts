'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem } from '@/types'

const CART_KEY = 'rawcut_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

// Simple event emitter so multiple components stay in sync
const listeners = new Set<() => void>()
function notifyListeners() {
  listeners.forEach((fn) => fn())
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setHydrated(true)
    const handler = () => setItems(loadCart())
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  const addItem = useCallback((item: CartItem) => {
    const current = loadCart()
    const key = (i: CartItem) => `${i.productId}-${i.variant?.size ?? ''}-${i.variant?.color ?? ''}`
    const existing = current.find((i) => key(i) === key(item))
    let next: CartItem[]
    if (existing) {
      next = current.map((i) => (key(i) === key(item) ? { ...i, quantity: i.quantity + item.quantity } : i))
    } else {
      next = [...current, item]
    }
    saveCart(next)
    setItems(next)
    notifyListeners()
  }, [])

  const removeItem = useCallback((productId: string, variant?: { size?: string; color?: string }) => {
    const current = loadCart()
    const next = current.filter(
      (i) => !(i.productId === productId && i.variant?.size === variant?.size && i.variant?.color === variant?.color)
    )
    saveCart(next)
    setItems(next)
    notifyListeners()
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: { size?: string; color?: string }) => {
    const current = loadCart()
    const next = current.map((i) => {
      if (i.productId === productId && i.variant?.size === variant?.size && i.variant?.color === variant?.color) {
        return { ...i, quantity }
      }
      return i
    }).filter((i) => i.quantity > 0)
    saveCart(next)
    setItems(next)
    notifyListeners()
  }, [])

  const clearCart = useCallback(() => {
    saveCart([])
    setItems([])
    notifyListeners()
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalWeight = items.reduce((sum, i) => sum + (i.weight ?? 0) * i.quantity, 0)

  return { items, hydrated, addItem, removeItem, updateQuantity, clearCart, subtotal, totalWeight }
}
