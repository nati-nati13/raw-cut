import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'

const CreateProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  categorySlug: z.string(),
  type: z.enum(['physical', 'digital']),
  images: z.array(z.string()).optional(),
  digitalFileUrl: z.string().optional(),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.number().int().min(0),
        sku: z.string(),
      })
    )
    .optional(),
  weight: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)

    const query: any = { status: 'published' }
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const designer = searchParams.get('designer')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 24

    if (q) query.$text = { $search: q }
    if (type) query.type = type
    if (designer) query.designer = designer
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (category) {
      const cat = await Category.findOne({ slug: category })
      if (cat) query.category = cat._id
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('designer', 'name username storeName avatar')
        .populate('category', 'name slug')
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'designer' || session.user.designerStatus !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = CreateProductSchema.parse(body)

    await connectDB()

    const category = await Category.findOne({ slug: data.categorySlug })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    // Generate URL-safe slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const suffix = Math.random().toString(36).slice(2, 7)
    const slug = `${baseSlug}-${suffix}`

    const product = await Product.create({
      ...data,
      slug,
      category: category._id,
      designer: session.user.id,
      status: 'pending_review',
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
