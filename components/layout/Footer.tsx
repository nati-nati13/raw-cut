import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <p className="font-bold text-lg">RAW CUT</p>
            <p className="text-sm text-gray-500 mt-2">Uncut Talent. Curated Style.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Shop</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-black">All Products</Link></li>
              <li><Link href="/designers" className="hover:text-black">Designers</Link></li>
              <li><Link href="/products?type=digital" className="hover:text-black">Digital</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Sell</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register?role=designer" className="hover:text-black">Become a Designer</Link></li>
              <li><Link href="/dashboard/designer" className="hover:text-black">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-black">About</Link></li>
              <li><Link href="/contact" className="hover:text-black">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-black">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-black">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} RAW CUT. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
