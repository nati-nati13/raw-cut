'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Sparkles, X } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([])
  const [type, setType] = useState<'physical' | 'digital'>('physical')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [title, setTitle] = useState('')
  const [categorySlug, setCategorySlug] = useState('')

  useEffect(() => {
    fetch('/api/products?status=__categories__')
    // Fetch categories from a simple endpoint
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  async function generateDescription() {
    if (!title || !categorySlug) {
      toast.error('Enter title and select category first')
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: categorySlug, tags }),
      })
      const data = await res.json()
      if (data.description) setDescription(data.description)
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  async function generateTags() {
    if (!title) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category: categorySlug }),
      })
      const data = await res.json()
      if (data.tags) setTags((prev) => [...new Set([...prev, ...data.tags])])
    } catch {
      toast.error('AI tag generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase()
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
      setTagInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const body = {
      title,
      description,
      price: Number(form.get('price')),
      categorySlug,
      type,
      tags,
      ...(type === 'physical' && {
        weight: Number(form.get('weight')) || 500,
      }),
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Product submitted for review')
      router.push('/dashboard/designer/products')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">New product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div className="flex rounded-lg border p-1 w-fit">
          {(['physical', 'digital'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                type === t ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Structured wool blazer"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={categorySlug} onValueChange={(v) => setCategorySlug(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="clothing">Clothing</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Description with AI */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Description</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateDescription}
              disabled={aiLoading}
              className="text-xs gap-1 h-7"
            >
              <Sparkles className="h-3 w-3" />
              {aiLoading ? 'Generating…' : 'Generate with AI'}
            </Button>
          </div>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Describe your product…"
          />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <Label>Price (USD)</Label>
          <Input name="price" type="number" step="0.01" min="1" required placeholder="0.00" />
        </div>

        {/* Physical-only fields */}
        {type === 'physical' && (
          <div className="space-y-1">
            <Label>Weight (grams)</Label>
            <Input name="weight" type="number" min="1" placeholder="500" />
            <p className="text-xs text-gray-400">Used to calculate shipping cost for customers.</p>
          </div>
        )}

        <Separator />

        {/* Tags with AI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tags</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateTags}
              disabled={aiLoading}
              className="text-xs gap-1 h-7"
            >
              <Sparkles className="h-3 w-3" />
              Suggest tags
            </Button>
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type a tag and press Enter"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-md p-3">
          Product will be submitted for admin review before going live.
        </p>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit for review'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
