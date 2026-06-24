import Link from 'next/link'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Product from '@/models/Product'
import Order from '@/models/Order'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/')

  await connectDB()

  const [
    pendingDesigners,
    totalDesigners,
    pendingProducts,
    totalProducts,
    totalOrders,
    totalRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'designer', status: 'pending' }),
    User.countDocuments({ role: 'designer', status: 'approved' }),
    Product.countDocuments({ status: 'pending_review' }),
    Product.countDocuments({ status: 'published' }),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ])

  const revenue = totalRevenue[0]?.total ?? 0

  const stats = [
    { label: 'Pending designers', value: pendingDesigners, href: '/dashboard/admin/designers', urgent: pendingDesigners > 0 },
    { label: 'Active designers', value: totalDesigners, href: '/dashboard/admin/designers' },
    { label: 'Pending products', value: pendingProducts, href: '/dashboard/admin/products', urgent: pendingProducts > 0 },
    { label: 'Published products', value: totalProducts, href: '/dashboard/admin/products' },
    { label: 'Total orders', value: totalOrders, href: '#' },
    { label: 'Total revenue', value: `$${revenue.toFixed(2)}`, href: '#' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and moderation queue</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`border rounded-lg p-5 hover:bg-gray-50 transition-colors ${s.urgent ? 'border-orange-300 bg-orange-50' : ''}`}
          >
            <p className={`text-2xl font-bold ${s.urgent ? 'text-orange-600' : ''}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            {s.urgent && <p className="text-xs text-orange-500 mt-1">Needs attention</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/admin/designers"
          className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50"
        >
          <div>
            <p className="font-semibold">Designer applications</p>
            <p className="text-sm text-gray-500">Review and approve/reject applicants</p>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/dashboard/admin/products"
          className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50"
        >
          <div>
            <p className="font-semibold">Product reviews</p>
            <p className="text-sm text-gray-500">Publish or reject pending products</p>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
      </div>
    </div>
  )
}
