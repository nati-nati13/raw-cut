'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  product: any
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const hasVariants = product.variants?.length > 0
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    hasVariants ? undefined : '__none__'
  )

  const variant = hasVariants
    ? product.variants.find((v: any) => `${v.size ?? ''}-${v.color ?? ''}` === selectedVariant)
    : null

  const outOfStock = hasVariants ? (!variant || variant.stock === 0) : false

  function handleAdd() {
    const v = variant ? { size: variant.size, color: variant.color } : undefined
    addItem({
      productId: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0] ?? '',
      quantity: 1,
      variant: v,
      type: product.type,
      designerId: product.designer._id,
      designerName: product.designer.storeName ?? product.designer.name,
      weight: product.weight,
    })
    toast.success('Added to cart')
  }

  return (
    <div className="space-y-3">
      {hasVariants && (
        <div className="space-y-2">
          {/* Size selector */}
          {product.variants.some((v: any) => v.size) && (
            <Select onValueChange={(v) => setSelectedVariant(v != null ? String(v) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {product.variants
                  .filter((v: any, i: number, arr: any[]) => arr.findIndex((x) => x.size === v.size) === i)
                  .map((v: any) => (
                    <SelectItem key={v.size} value={`${v.size ?? ''}-${v.color ?? ''}`}>
                      {v.size} {v.stock === 0 ? '(Out of stock)' : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

          )}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleAdd}
        disabled={outOfStock || (hasVariants && !selectedVariant)}
      >
        {outOfStock ? 'Out of stock' : product.type === 'digital' ? 'Buy digital download' : 'Add to cart'}
      </Button>
    </div>
  )
}
