import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    const designers = await User.find({ role: 'designer', status: 'approved' })
      .select('name username storeName bio avatar createdAt')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(designers)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
