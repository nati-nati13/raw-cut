import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { getMockProduct } from '@/lib/mock-data'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getMockProduct(slug)
  if (!product) notFound()

  const designer = product.designer
  const displayName = designer.storeName ?? designer.name

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                ✂
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                  <Image
                    src={img}
                    alt={`${product.title} ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <Link
              href={`/designers/${designer.username}`}
              className="text-sm text-gray-500 hover:text-black"
            >
              {displayName}
            </Link>
            <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
            <p className="text-2xl font-semibold mt-2">
              {product.currency} {product.price.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{product.category.name}</Badge>
            <Badge variant="secondary">
              {product.type === 'digital' ? 'Digital download' : 'Physical'}
            </Badge>
          </div>

          <Separator />

          <AddToCartButton product={product} />

          <Separator />

          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {product.aiDescription ?? product.description}
            </p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/products?q=${tag}`}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Designer card */}
          <div className="border rounded-lg p-4 flex items-center gap-4">
            <Link href={`/designers/${designer.username}`} className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                {designer.avatar ? (
                  <Image
                    src={designer.avatar}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm text-gray-400">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div>
              <Link
                href={`/designers/${designer.username}`}
                className="font-medium hover:underline text-sm"
              >
                {displayName}
              </Link>
              {designer.bio && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{designer.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
