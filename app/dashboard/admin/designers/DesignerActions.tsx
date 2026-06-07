'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminDesignerActions({ designerId }: { designerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function action(decision: 'approve' | 'reject') {
    setLoading(true)
    const res = await fetch(`/api/admin/designers/${designerId}/${decision}`, { method: 'PUT' })
    if (res.ok) {
      toast.success(`Designer ${decision}d`)
      router.refresh()
    } else {
      toast.error('Action failed')
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" onClick={() => action('approve')} disabled={loading}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => action('reject')} disabled={loading}>
        Reject
      </Button>
    </div>
  )
}
