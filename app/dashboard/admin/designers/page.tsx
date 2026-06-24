import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Image from 'next/image'
import Link from 'next/link'
import { AdminDesignerActions } from './DesignerActions'

export default async function AdminDesignersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/')

  await connectDB()

  const [pending, approved, rejected] = await Promise.all([
    User.find({ role: 'designer', status: 'pending' }).sort({ createdAt: -1 }).lean(),
    User.find({ role: 'designer', status: 'approved' }).sort({ createdAt: -1 }).lean(),
    User.find({ role: 'designer', status: 'rejected' }).sort({ updatedAt: -1 }).limit(20).lean(),
  ])

  function DesignerRow({ designer, showActions }: { designer: any; showActions: boolean }) {
    const d = designer
    return (
      <div className="flex items-center gap-4 py-4 border-b last:border-0">
        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
          {d.avatar ? (
            <Image src={d.avatar} alt={d.name} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">
              {d.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{d.storeName ?? d.name}</p>
          <p className="text-xs text-gray-500">{d.email}</p>
          {d.username && (
            <Link href={`/designers/${d.username}`} className="text-xs text-gray-400 hover:text-black" target="_blank">
              @{d.username} ↗
            </Link>
          )}
          {d.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{d.bio}</p>}
          {d.socialLinks?.instagram && (
            <p className="text-xs text-gray-400">ig: @{d.socialLinks.instagram}</p>
          )}
          <p className="text-xs text-gray-300 mt-0.5">
            Applied {new Date(d.createdAt).toLocaleDateString()}
          </p>
        </div>
        {showActions && <AdminDesignerActions designerId={d._id.toString()} />}
        {!showActions && (
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {d.status}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Designer applications</h1>
        <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-black">← Admin</Link>
      </div>

      {/* Pending */}
      <section className="space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          Pending
          {pending.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending applications.</p>
        ) : (
          <div className="border rounded-lg px-4">
            {pending.map((d: any) => (
              <DesignerRow key={d._id.toString()} designer={d} showActions={true} />
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-500">Approved ({approved.length})</h2>
        {approved.length > 0 && (
          <div className="border rounded-lg px-4">
            {approved.map((d: any) => (
              <DesignerRow key={d._id.toString()} designer={d} showActions={false} />
            ))}
          </div>
        )}
      </section>

      {/* Rejected */}
      {rejected.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-500">Rejected (last 20)</h2>
          <div className="border rounded-lg px-4">
            {rejected.map((d: any) => (
              <DesignerRow key={d._id.toString()} designer={d} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
