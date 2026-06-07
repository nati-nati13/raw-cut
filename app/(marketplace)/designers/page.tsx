import type { Metadata } from 'next'
import { mockDesigners } from '@/lib/mock-data'
import { DesignerCard } from '@/components/designer/DesignerCard'

export const metadata: Metadata = { title: 'Designers' }

export default function DesignersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Designers</h1>
        <p className="text-gray-500 mt-2">
          {mockDesigners.length} independent creator{mockDesigners.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {mockDesigners.map((d) => (
          <DesignerCard key={d._id} designer={d} />
        ))}
      </div>
    </div>
  )
}
