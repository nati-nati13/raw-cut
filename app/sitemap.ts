import type { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import User from '@/models/User'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raw-cut.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const [products, designers] = await Promise.all([
    Product.find({ status: 'published' }).select('slug updatedAt').lean(),
    User.find({ role: 'designer', status: 'approved' }).select('username updatedAt').lean(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/designers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products as any[]).map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const designerRoutes: MetadataRoute.Sitemap = (designers as any[]).map((d) => ({
    url: `${BASE}/designers/${d.username}`,
    lastModified: d.updatedAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...designerRoutes]
}
