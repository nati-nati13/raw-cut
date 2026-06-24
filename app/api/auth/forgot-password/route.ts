import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() })

    // Always 200 — don't reveal whether email exists
    if (!user) return NextResponse.json({ ok: true })

    const rawToken = randomBytes(32).toString('hex')
    const hashedToken = createHash('sha256').update(rawToken).digest('hex')

    await User.findByIdAndUpdate(user._id, {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    await sendPasswordResetEmail(user.email, user.name, rawToken)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
