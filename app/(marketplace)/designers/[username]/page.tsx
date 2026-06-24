import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Separator } from '@/components/ui/separator'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Product from '@/models/Product'

interface Props {
  params: Promise<{ username: string }>
}

async function getDesigner(username: string) {
  await connectDB()
  const designer = await User.findOne({
    username,
    role: 'designer',
    status: 'approved',
  })
    .select('name username storeName bio avatar socialLinks')
    .lean()
  return designer
}

async function getDesignerProducts(designerId: string) {
  return Product.find({ designer: designerId, status: 'published' })
    .populate('designer', 'name username storeName avatar')
    .populate('category', 'name slug')
    .sort({ featured: -1, createdAt: -1 })
    .lean()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const designer = await getDesigner(username)
  if (!designer) return { title: 'Designer not found' }

  const d = designer as any
  const displayName = d.storeName ?? d.name

  return {
    title: `${displayName} — RAW&CUT`,
    description: d.bio ?? `Shop ${displayName}'s collection on RAW&CUT — independent fashion marketplace.`,
    openGraph: {
      title: `${displayName} — RAW&CUT`,
      description: d.bio ?? `Shop ${displayName}'s collection on RAW&CUT.`,
      images: d.avatar ? [{ url: d.avatar, width: 400, height: 400, alt: displayName }] : undefined,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${displayName} — RAW&CUT`,
      description: d.bio,
      images: d.avatar ? [d.avatar] : undefined,
    },
  }
}

export default async function DesignerStorefrontPage({ params }: Props) {
  const { username } = await params
  const designer = await getDesigner(username)
  if (!designer) notFound()

  const d = designer as any
  const products = await getDesignerProducts(d._id.toString())
  const displayName = d.storeName ?? d.name
  const soldCount = (products as any[]).reduce((sum, p) => sum + (p.soldCount ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {d.avatar ? (
                <Image
                  src={d.avatar}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-gray-400 text-sm mt-0.5">@{d.username}</p>
              {d.bio && <p className="text-gray-600 mt-2 max-w-lg">{d.bio}</p>}
              <div className="flex gap-4 mt-2">
                {d.socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${d.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-black"
                  >
                    Instagram ↗
                  </a>
                )}
                {d.socialLinks?.website && (
                  <a
                    href={d.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-black"
                  >
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-6">
            <div>
              <p className="text-lg font-semibold">{products.length}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{soldCount}</p>
              <p className="text-xs text-gray-500">Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Separator className="mb-8" />
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No products listed yet.</p>
        ) : (
          <ProductGrid products={products as any} />
        )}
      </div>
    </div>
  )
}
