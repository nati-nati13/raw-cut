import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    await User.findByIdAndUpdate(id, { status: 'rejected' })
    return NextResponse.json({ message: 'Rejected' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
