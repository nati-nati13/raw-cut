'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = params.get('role') === 'designer' ? 'designer' : 'customer'
  const [role, setRole] = useState<'customer' | 'designer'>(defaultRole)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
      role,
      ...(role === 'designer' && {
        username: form.get('username'),
        storeName: form.get('storeName'),
      }),
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error ?? 'Registration failed')
      setLoading(false)
      return
    }

    if (role === 'designer') {
      toast.success('Account created! Await admin approval before selling.')
      router.push('/pending-approval')
      return
    }

    await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    router.push('/')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Join RAW CUT as a customer or designer.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-lg border p-1 mb-6">
          {(['customer', 'designer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors capitalize ${
                role === r ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {r === 'designer' ? 'Designer (apply)' : 'Customer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>

          {role === 'designer' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center border rounded-md">
                  <span className="px-3 text-sm text-gray-400">rawcut.com/designers/</span>
                  <Input
                    id="username"
                    name="username"
                    className="border-0 focus-visible:ring-0 pl-0"
                    placeholder="your-name"
                    pattern="[a-z0-9_-]+"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" name="storeName" placeholder="My Brand" />
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
                Designer accounts are reviewed by our team before activation.
              </p>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? 'Creating account…'
              : role === 'designer'
              ? 'Apply as designer'
              : 'Create account'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-black underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
