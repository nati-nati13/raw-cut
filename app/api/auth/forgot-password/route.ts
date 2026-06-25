import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkAuthRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const limited = await checkAuthRateLimit(req)
  if (limited) return limited

  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const rawToken = randomBytes(32).toString('hex')
    const hashedToken = createHash('sha256').update(rawToken).digest('hex')

    await connectDB()

    // Atomic find + update — eliminates TOCTOU race between findOne and findByIdAndUpdate.
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
      { new: true }
    )

    // Always 200 — don't reveal whether email exists
    if (!user) return NextResponse.json({ ok: true })

    await sendPasswordResetEmail(user.email, user.name, rawToken)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
