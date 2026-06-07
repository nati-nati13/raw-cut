'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ProductFiltersProps {
  categories: { _id: string; name: string; slug: string }[]
  params: Record<string, string | undefined>
}

export function ProductFilters({ categories, params }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string | undefined) {
    const next = new URLSearchParams()
    Object.entries({ ...params, [key]: value, page: '1' }).forEach(([k, v]) => {
      if (v) next.set(k, v)
    })
    if (!value) next.delete(key)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide">Search</Label>
        <Input
          placeholder="Search products…"
          defaultValue={params.q}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value)
          }}
        />
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide">Category</Label>
        <div className="space-y-1">
          <button
            onClick={() => update('category', undefined)}
            className={`block text-sm w-full text-left px-2 py-1 rounded ${!params.category ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => update('category', cat.slug)}
              className={`block text-sm w-full text-left px-2 py-1 rounded ${params.category === cat.slug ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide">Type</Label>
        <div className="space-y-1">
          {[{ label: 'All', value: undefined }, { label: 'Physical', value: 'physical' }, { label: 'Digital', value: 'digital' }].map((opt) => (
            <button
              key={opt.label}
              onClick={() => update('type', opt.value)}
              className={`block text-sm w-full text-left px-2 py-1 rounded ${params.type === opt.value || (!params.type && !opt.value) ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide">Price (USD)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            defaultValue={params.minPrice}
            className="w-20"
            onBlur={(e) => update('minPrice', e.target.value || undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            defaultValue={params.maxPrice}
            className="w-20"
            onBlur={(e) => update('maxPrice', e.target.value || undefined)}
          />
        </div>
      </div>

      {(params.category || params.type || params.minPrice || params.maxPrice || params.q) && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(pathname)}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
