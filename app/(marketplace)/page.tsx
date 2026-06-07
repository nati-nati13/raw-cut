import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product/ProductGrid'
import { DesignerCard } from '@/components/designer/DesignerCard'
import { getMockFeaturedProducts, mockDesigners } from '@/lib/mock-data'

export default function HomePage() {
  const products = getMockFeaturedProducts()
  const designers = mockDesigners.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              Curated Marketplace
            </p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Uncut Talent.
              <br />
              Curated Style.
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              Discover and buy directly from independent fashion and product designers around the
              world.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                asChild
              >
                <Link href="/products">Shop now</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-gray-300 hover:text-white"
                asChild
              >
                <Link href="/register?role=designer">Sell your work →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-black">
            View all →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>

      {/* Featured Designers */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Designers</h2>
            <Link href="/designers" className="text-sm text-gray-500 hover:text-black">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {designers.map((designer) => (
              <DesignerCard key={designer._id} designer={designer} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '6', label: 'Designers' },
              { value: '12', label: 'Products' },
              { value: 'Global', label: 'Shipping' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for designers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Are you a designer?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Apply to sell on RAW CUT. Reach customers worldwide. We handle payments — you handle
          shipping.
        </p>
        <Button size="lg" asChild>
          <Link href="/register?role=designer">Apply now</Link>
        </Button>
      </section>
    </div>
  )
}
