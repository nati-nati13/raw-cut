import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  await connectDB()
  const product = await Product.findOne({ slug, status: 'published' })
    .populate('designer', 'name username storeName bio avatar socialLinks')
    .populate('category', 'name slug')
    .lean()
  return product
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product not found' }

  const p = product as any
  const designerName = p.designer?.storeName ?? p.designer?.name ?? 'RAW&CUT'
  const image = p.images?.[0]

  return {
    title: `${p.title} by ${designerName} — RAW&CUT`,
    description: p.aiDescription ?? p.description ?? `Shop ${p.title} from ${designerName} on RAW&CUT.`,
    openGraph: {
      title: `${p.title} — RAW&CUT`,
      description: p.aiDescription ?? p.description,
      images: image ? [{ url: image, width: 800, height: 800, alt: p.title }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.title} — RAW&CUT`,
      description: p.aiDescription ?? p.description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const p = product as any
  const designer = p.designer
  const displayName = designer?.storeName ?? designer?.name ?? 'Unknown'

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: p.title,
            description: p.aiDescription ?? p.description,
            image: p.images ?? [],
            offers: {
              '@type': 'Offer',
              price: p.price,
              priceCurrency: p.currency ?? 'USD',
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: 'RAW&CUT' },
            },
            brand: { '@type': 'Brand', name: displayName },
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {p.images?.[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.title}
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
            {p.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {p.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                    <Image
                      src={img}
                      alt={`${p.title} ${i + 2}`}
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
              {designer && (
                <Link
                  href={`/designers/${designer.username}`}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {displayName}
                </Link>
              )}
              <h1 className="text-2xl font-bold mt-1">{p.title}</h1>
              <p className="text-2xl font-semibold mt-2">
                {p.currency ?? 'USD'} {p.price.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {p.category && <Badge variant="outline">{p.category.name}</Badge>}
              <Badge variant="secondary">
                {p.type === 'digital' ? 'Digital download' : 'Physical'}
              </Badge>
            </div>

            <Separator />

            <AddToCartButton product={p} />

            <Separator />

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {p.aiDescription ?? p.description}
              </p>
            </div>

            {p.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {p.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/products?q=${encodeURIComponent(tag)}`}
                    className="text-xs text-gray-400 hover:text-black"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Designer card */}
            {designer && (
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
            )}
          </div>
        </div>
      </div>
    </>
  )
}
