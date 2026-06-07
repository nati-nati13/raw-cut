import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { generateProductDescription } from '@/lib/ai'

const Schema = z.object({
  title: z.string().min(3),
  category: z.string(),
  tags: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'designer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = Schema.parse(body)
    const description = await generateProductDescription(data)
    return NextResponse.json({ description })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
