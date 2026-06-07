'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminProductActions({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function action(status: 'published' | 'rejected') {
    setLoading(true)
    const res = await fetch(`/api/products/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(status === 'published' ? 'Product published' : 'Product rejected')
      router.refresh()
    } else {
      toast.error('Action failed')
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" onClick={() => action('published')} disabled={loading}>
        Publish
      </Button>
      <Button size="sm" variant="outline" onClick={() => action('rejected')} disabled={loading}>
        Reject
      </Button>
    </div>
  )
}
