import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import Image from 'next/image'
import Link from 'next/link'
import { AdminProductActions } from './ProductActions'

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/')

  await connectDB()

  const [pending, recent] = await Promise.all([
    Product.find({ status: 'pending_review' })
      .populate('designer', 'name username storeName')
      .sort({ createdAt: -1 })
      .lean(),
    Product.find({ status: { $in: ['published', 'rejected'] } })
      .populate('designer', 'name username storeName')
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean(),
  ])

  function ProductRow({ product, showActions }: { product: any; showActions: boolean }) {
    const p = product
    const designer = p.designer
    return (
      <div className="flex items-start gap-4 py-4 border-b last:border-0">
        <div className="relative w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
          {p.images?.[0] ? (
            <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">✂</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{p.title}</p>
          <p className="text-xs text-gray-500">
            by {designer?.storeName ?? designer?.name ?? 'Unknown'}
            {designer?.username && (
              <Link href={`/designers/${designer.username}`} className="ml-1 text-gray-400 hover:text-black" target="_blank">
                @{designer.username} ↗
              </Link>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {p.currency ?? 'USD'} {p.price?.toFixed(2)} · {p.type}
          </p>
          {p.tags?.length > 0 && (
            <p className="text-xs text-gray-300">{p.tags.slice(0, 5).join(', ')}</p>
          )}
          <p className="text-xs text-gray-300 mt-0.5">
            Submitted {new Date(p.createdAt).toLocaleDateString()}
          </p>
        </div>
        {showActions ? (
          <AdminProductActions productId={p._id.toString()} slug={p.slug} />
        ) : (
          <span className={`text-xs px-2 py-1 rounded-full capitalize shrink-0 ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {p.status}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product reviews</h1>
        <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-black">← Admin</Link>
      </div>

      {/* Pending */}
      <section className="space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          Pending review
          {pending.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No products pending review.</p>
        ) : (
          <div className="border rounded-lg px-4">
            {pending.map((p: any) => (
              <ProductRow key={p._id.toString()} product={p} showActions={true} />
            ))}
          </div>
        )}
      </section>

      {/* Recent decisions */}
      {recent.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-500">Recent decisions</h2>
          <div className="border rounded-lg px-4">
            {recent.map((p: any) => (
              <ProductRow key={p._id.toString()} product={p} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
