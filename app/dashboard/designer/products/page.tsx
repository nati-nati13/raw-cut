import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DesignerProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Products</h1>
        <Button size="sm" asChild>
          <Link href="/dashboard/designer/products/new">+ New</Link>
        </Button>
      </div>
      <div className="border rounded-lg p-12 text-center text-gray-400 text-sm">
        Connect MongoDB to manage products.
      </div>
    </div>
  )
}
