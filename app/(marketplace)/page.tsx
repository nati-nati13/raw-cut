import Link from 'next/link'
import Image from 'next/image'
import { getMockFeaturedProducts, mockDesigners, mockProducts } from '@/lib/mock-data'

const MARQUEE_ITEM =
  'RAW CUT  ·  INDEPENDENT DESIGNERS  ·  TBILISI  ·  HANDMADE  ·  UNCUT TALENT  ·  SLOW FASHION  ·  '
const MARQUEE_COPY = MARQUEE_ITEM.repeat(6)

export default function HomePage() {
  const featured = getMockFeaturedProducts()
  const designers = mockDesigners.slice(0, 6)
  const heroProducts = mockProducts.slice(0, 6)

  return (
    <div>
      {/* ── HERO ── */}
      <section
        style={{ backgroundColor: 'var(--rc-linen)' }}
        className="overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 min-h-[88vh]">

            {/* Left: Headline */}
            <div className="flex flex-col justify-center py-24 lg:py-16 lg:pr-14">
              <p
                className="text-[10px] font-medium tracking-[0.28em] uppercase mb-8"
                style={{ color: 'var(--rc-dust)' }}
              >
                Independent Designers — Curated Marketplace
              </p>
              <h1
                className="leading-[0.86] mb-8"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(3.8rem, 7.5vw, 7rem)',
                  color: 'var(--rc-ink)',
                  fontWeight: 700,
                }}
              >
                <span className="block">Uncut</span>
                <span
                  className="block"
                  style={{ color: 'var(--rc-chalk)', fontStyle: 'italic' }}
                >
                  Talent.
                </span>
                <span className="block">Curated</span>
                <span className="block">Style.</span>
              </h1>
              <p
                className="text-sm leading-relaxed mb-10 max-w-[300px]"
                style={{ color: 'var(--rc-dust)' }}
              >
                Buy directly from independent fashion and product designers. Every piece is
                handmade, limited, and ships from the maker.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-white transition-opacity hover:opacity-75"
                  style={{ backgroundColor: 'var(--rc-ink)' }}
                >
                  Shop now
                </Link>
                <Link
                  href="/register?role=designer"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase border transition-colors hover:bg-black/5"
                  style={{ borderColor: 'var(--rc-ink)', color: 'var(--rc-ink)' }}
                >
                  Sell your work →
                </Link>
              </div>
            </div>

            {/* Right: Product mosaic */}
            <div
              className="hidden lg:grid grid-cols-2 gap-1.5 py-6 overflow-hidden"
              style={{ marginRight: '-2rem' }}
            >
              {heroProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="relative aspect-square overflow-hidden group block"
                >
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="25vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: '#e8e4dc' }}
                    >
                      ✂
                    </div>
                  )}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div
        className="py-3.5 overflow-hidden select-none"
        style={{ backgroundColor: 'var(--rc-ink)' }}
      >
        <div className="rc-marquee-track">
          <span
            className="text-[10px] font-medium tracking-[0.28em] uppercase shrink-0"
            style={{ color: 'var(--rc-chalk)' }}
          >
            {MARQUEE_COPY}
          </span>
          <span
            aria-hidden
            className="text-[10px] font-medium tracking-[0.28em] uppercase shrink-0"
            style={{ color: 'var(--rc-chalk)' }}
          >
            {MARQUEE_COPY}
          </span>
        </div>
      </div>

      {/* ── FEATURED WORK ── */}
      <section style={{ backgroundColor: 'var(--rc-paper)' }} className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-12">
            <h2
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                color: 'var(--rc-ink)',
                fontWeight: 600,
              }}
            >
              Featured Work
            </h2>
            <Link
              href="/products"
              className="text-[10px] font-medium tracking-[0.2em] uppercase hover:underline"
              style={{ color: 'var(--rc-dust)' }}
            >
              All products →
            </Link>
          </div>

          {/* Editorial grid: 1 large + smaller items */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featured[0] && (
              <Link
                href={`/products/${featured[0].slug}`}
                className="group col-span-2 row-span-2 block"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {featured[0].images[0] && (
                    <Image
                      src={featured[0].images[0]}
                      alt={featured[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="50vw"
                    />
                  )}
                </div>
                <div className="mt-3">
                  <p
                    className="text-[10px] uppercase tracking-widest mb-0.5"
                    style={{ color: 'var(--rc-dust)' }}
                  >
                    {featured[0].designer.storeName ?? featured[0].designer.name}
                  </p>
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: 'var(--rc-ink)' }}
                  >
                    {featured[0].title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--rc-dust)' }}>
                    {featured[0].currency} {featured[0].price}
                  </p>
                </div>
              </Link>
            )}

            {featured.slice(1, 5).map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="25vw"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <p
                    className="text-[10px] uppercase tracking-widest mb-0.5"
                    style={{ color: 'var(--rc-dust)' }}
                  >
                    {product.designer.storeName ?? product.designer.name}
                  </p>
                  <p
                    className="text-xs font-medium leading-snug line-clamp-1"
                    style={{ color: 'var(--rc-ink)' }}
                  >
                    {product.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--rc-dust)' }}>
                    {product.currency} {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE MAKERS ── */}
      <section style={{ backgroundColor: 'var(--rc-ink)' }} className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-12">
            <h2
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                color: 'var(--rc-linen)',
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              The Makers.
            </h2>
            <Link
              href="/designers"
              className="text-[10px] font-medium tracking-[0.2em] uppercase hover:underline"
              style={{ color: 'var(--rc-chalk)' }}
            >
              All designers →
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
            {designers.map((designer) => (
              <Link
                key={designer._id}
                href={`/designers/${designer.username}`}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative h-16 w-16 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-2 group-hover:ring-[#d4a853] group-hover:ring-offset-2 group-hover:ring-offset-[#1a1614] transition-all duration-300">
                  {designer.avatar ? (
                    <Image
                      src={designer.avatar}
                      alt={designer.storeName ?? designer.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: '#2e2825', color: 'var(--rc-linen)' }}
                    >
                      {(designer.storeName ?? designer.name).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-medium transition-colors group-hover:text-[#d4a853]"
                    style={{ color: 'var(--rc-linen)' }}
                  >
                    {designer.storeName ?? designer.name}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--rc-dust)' }}>
                    @{designer.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{ backgroundColor: 'var(--rc-linen)', borderBottom: '1px solid rgba(26,22,20,0.12)' }}
        className="py-20 sm:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                step: 'Find.',
                copy: 'Browse work from independent designers across clothing, jewellery, objects, and digital prints.',
              },
              {
                step: 'Buy.',
                copy: 'Secure checkout. We handle payment — designers focus on making, not logistics.',
              },
              {
                step: 'Receive.',
                copy: 'Ships directly from the maker. Worldwide delivery. Real people, real craft.',
              },
            ].map(({ step, copy }) => (
              <div key={step}>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '2rem',
                    color: 'var(--rc-ink)',
                    fontWeight: 600,
                  }}
                >
                  {step}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--rc-dust)' }}>
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESIGNER CTA ── */}
      <section style={{ backgroundColor: 'var(--rc-paper)' }} className="py-28 sm:py-36 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-[10px] font-medium tracking-[0.28em] uppercase mb-8"
            style={{ color: 'var(--rc-dust)' }}
          >
            For designers
          </p>
          <h2
            className="leading-[0.9] mb-8"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              color: 'var(--rc-ink)',
              fontWeight: 700,
            }}
          >
            Sell your work.
          </h2>
          <p
            className="text-sm leading-relaxed mb-12 max-w-sm mx-auto"
            style={{ color: 'var(--rc-dust)' }}
          >
            Apply to sell on RAW CUT. We handle payments. You handle shipping. Customers
            worldwide.
          </p>
          <Link
            href="/register?role=designer"
            className="inline-flex items-center gap-2 px-10 py-4 text-[11px] font-semibold tracking-[0.18em] uppercase transition-opacity hover:opacity-75"
            style={{ backgroundColor: 'var(--rc-ink)', color: 'var(--rc-linen)' }}
          >
            Apply now
          </Link>
        </div>
      </section>
    </div>
  )
}
