import type { Metadata } from 'next'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { filterMockProducts, mockCategories } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Shop' }

interface SearchParams {
  category?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  q?: string
  [key: string]: string | undefined
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const products = filterMockProducts({
    q: params.q,
    category: params.category,
    type: params.type,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <ProductFilters categories={mockCategories} params={params} />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}
