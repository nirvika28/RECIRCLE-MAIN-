export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  console.log('POST /api/ecotrade/item - No auth required')
  try {
    const { title, description, price } = await req.json()
    console.log('Received item data:', { title, description, price })
    
    if (!title || !description || typeof price !== 'number' || price <= 0) {
      console.log('Validation failed:', { title: !!title, description: !!description, price, priceType: typeof price })
      return NextResponse.json({ message: 'title, description, and valid price required' }, { status: 400 })
    }

    console.log('Creating item in database...')
    // Use a default sellerId for now
    const item = await prisma.ecoTradeItem.create({
      data: { title, description, price, sellerId: 'default-user' }
    })

    console.log('Item created successfully:', { id: item.id, title: item.title })
    return NextResponse.json({ message: 'Item listed', item }, { status: 201 })
  } catch (error) {
    console.error('Ecotrade add item error:', error)
    return NextResponse.json({ message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, status: 500 })
  }
}
