import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 border-b">
        <Link href="/" className="font-bold text-lg">
          RAW CUT
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">{children}</main>
    </div>
  )
}
