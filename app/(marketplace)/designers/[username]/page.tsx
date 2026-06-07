import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Separator } from '@/components/ui/separator'
import { getMockDesigner, getMockDesignerProducts } from '@/lib/mock-data'

export default async function DesignerStorefrontPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const designer = getMockDesigner(username)
  if (!designer) notFound()

  const products = getMockDesignerProducts(designer._id)
  const displayName = designer.storeName ?? designer.name

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {designer.avatar ? (
                <Image
                  src={designer.avatar}
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
              <p className="text-gray-400 text-sm mt-0.5">@{designer.username}</p>
              {designer.bio && (
                <p className="text-gray-600 mt-2 max-w-lg">{designer.bio}</p>
              )}
              <div className="flex gap-4 mt-2">
                {designer.socialLinks?.instagram && (
                  <a
                    href={`https://instagram.com/${designer.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-black"
                  >
                    Instagram ↗
                  </a>
                )}
                {designer.socialLinks?.website && (
                  <a
                    href={designer.socialLinks.website}
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
              <p className="text-lg font-semibold">
                {products.reduce((sum, p) => sum + p.soldCount, 0)}
              </p>
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
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
