import type { Metadata } from 'next'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Shop — RAW&CUT',
  description: 'Browse curated products from independent fashion and product designers.',
}

interface SearchParams {
  category?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  q?: string
  page?: string
  [key: string]: string | undefined
}

const LIMIT = 24

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))

  await connectDB()

  const query: Record<string, unknown> = { status: 'published' }

  if (params.q) query.$text = { $search: params.q }
  if (params.type) query.type = params.type
  if (params.minPrice || params.maxPrice) {
    const price: Record<string, number> = {}
    if (params.minPrice) price.$gte = Number(params.minPrice)
    if (params.maxPrice) price.$lte = Number(params.maxPrice)
    query.price = price
  }
  if (params.category) {
    const cat = await Category.findOne({ slug: params.category }).lean()
    if (cat) query.category = (cat as any)._id
  }

  const [products, total, categories] = await Promise.all([
    Product.find(query)
      .populate('designer', 'name username storeName avatar')
      .populate('category', 'name slug')
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean(),
    Product.countDocuments(query),
    Category.find().sort({ name: 1 }).lean(),
  ])

  const pages = Math.ceil(total / LIMIT)

  // Build pagination URL helper
  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    Object.entries({ ...params, page: String(p) }).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    return `/products?${sp.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <ProductFilters categories={categories as any} params={params} />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {total} product{total !== 1 ? 's' : ''}
              {pages > 1 && ` — page ${page} of ${pages}`}
            </p>
          </div>

          <ProductGrid products={products as any} />

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  ← Prev
                </Link>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-gray-300">…</span>
                    )}
                    <Link
                      href={pageUrl(p)}
                      className={`px-3 py-2 border rounded text-sm ${p === page ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < pages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
