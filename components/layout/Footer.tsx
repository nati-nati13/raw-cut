import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--rc-ink)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <p
              className="font-black text-lg tracking-[-0.02em] uppercase"
              style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--rc-chalk)' }}
            >
              raw&amp;cut
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--rc-dust)' }}>
              Uncut Talent. Curated Style.
            </p>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--rc-linen)' }}
            >
              Shop
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--rc-dust)' }}>
              <li>
                <Link href="/products" className="hover:text-[#f4f0e8] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/designers" className="hover:text-[#f4f0e8] transition-colors">
                  Designers
                </Link>
              </li>
              <li>
                <Link
                  href="/products?type=digital"
                  className="hover:text-[#f4f0e8] transition-colors"
                >
                  Digital
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--rc-linen)' }}
            >
              Sell
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--rc-dust)' }}>
              <li>
                <Link
                  href="/register?role=designer"
                  className="hover:text-[#f4f0e8] transition-colors"
                >
                  Become a Designer
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/designer"
                  className="hover:text-[#f4f0e8] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--rc-linen)' }}
            >
              Company
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--rc-dust)' }}>
              <li>
                <Link href="/about" className="hover:text-[#f4f0e8] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#f4f0e8] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#f4f0e8] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#f4f0e8] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="mt-10 pt-8 text-center text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--rc-dust)' }}
        >
          © {new Date().getFullYear()} RAW CUT. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
