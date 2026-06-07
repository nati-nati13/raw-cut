import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    await connectDB()
    const { username } = await params
    const designer = await User.findOne({ username, role: 'designer', status: 'approved' })
      .select('name username storeName bio avatar socialLinks createdAt')
      .lean()
    if (!designer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(designer)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { username } = await params
    if (session.user.username !== username && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()
    const body = await req.json()
    // Prevent role/status escalation
    delete body.role
    delete body.status
    delete body.commissionRate

    const updated = await User.findOneAndUpdate({ username }, body, { new: true }).select(
      'name username storeName bio avatar socialLinks'
    )
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
