import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'

export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
