import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raw-cut.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/account/', '/orders/', '/checkout', '/cart'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
