import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB()
    const { slug } = await params
    const product = await Product.findOne({ slug, status: 'published' })
      .populate('designer', 'name username storeName bio avatar')
      .populate('category', 'name slug')
      .lean()
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { slug } = await params
    const product = await Product.findOne({ slug })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isOwner = product.designer.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()

    // Prevent designers from directly publishing
    if (session.user.role === 'designer' && body.status === 'published') {
      body.status = 'pending_review'
    }

    const updated = await Product.findOneAndUpdate({ slug }, body, { new: true })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { slug } = await params
    const product = await Product.findOne({ slug })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isOwner = product.designer.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await Product.findOneAndUpdate({ slug }, { status: 'archived' })
    return NextResponse.json({ message: 'Archived' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
