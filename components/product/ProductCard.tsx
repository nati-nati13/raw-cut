import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: {
    _id: string
    slug: string
    title: string
    price: number
    currency: string
    images: string[]
    type: string
    designer: {
      name: string
      username: string
      storeName?: string
    }
    category?: {
      name: string
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const displayName = product.designer.storeName ?? product.designer.name

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            ✂
          </div>
        )}
        {product.type === 'digital' && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Digital
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-500">{displayName}</p>
        <p className="font-medium text-sm line-clamp-2">{product.title}</p>
        <p className="font-semibold text-sm">
          {product.currency} {product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
