import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendWelcomeEmail } from '@/lib/email'
import { checkAuthRateLimit } from '@/lib/ratelimit'

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['customer', 'designer']),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/).optional(),
  storeName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const limited = await checkAuthRateLimit(req)
  if (limited) return limited

  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    await connectDB()

    const existing = await User.findOne({ email: data.email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    if (data.role === 'designer') {
      if (!data.username) {
        return NextResponse.json({ error: 'Username required for designers' }, { status: 400 })
      }
      const usernameTaken = await User.findOne({ username: data.username })
      if (usernameTaken) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const hashed = await bcrypt.hash(data.password, 10)

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      // Designers start as pending; customers are immediately active
      status: data.role === 'designer' ? 'pending' : 'approved',
      username: data.username,
      storeName: data.storeName,
    })

    // Fire-and-forget welcome email
    sendWelcomeEmail(user.email, user.name).catch(console.error)

    return NextResponse.json(
      { message: 'Account created', userId: user._id, status: user.status },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
