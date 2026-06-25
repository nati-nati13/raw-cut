import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
})

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raw-cut.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    template: '%s | RAW&CUT',
    default: 'RAW&CUT — Uncut Talent. Curated Style.',
  },
  description: 'Curated marketplace for independent fashion and product designers. Discover unique pieces made with intention.',
  keywords: ['fashion marketplace', 'independent designers', 'handmade fashion', 'designer clothes'],
  openGraph: {
    type: 'website',
    siteName: 'RAW&CUT',
    title: 'RAW&CUT — Uncut Talent. Curated Style.',
    description: 'Curated marketplace for independent fashion and product designers.',
    url: BASE,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rawandcut',
    title: 'RAW&CUT — Uncut Talent. Curated Style.',
    description: 'Curated marketplace for independent fashion and product designers.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
