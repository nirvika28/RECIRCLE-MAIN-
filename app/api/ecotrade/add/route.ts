export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { title, description, price } = await req.json()
    if (!title || !description || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
    }

    const item = await prisma.ecoTradeItem.create({
      data: {
        title,
        description,
        price,
        sellerId: decoded.userId,
        status: 'active',
      },
    })

    return NextResponse.json({ message: 'Item listed successfully', item }, { status: 201 })
  } catch (error) {
    console.error('Ecotrade add item error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
