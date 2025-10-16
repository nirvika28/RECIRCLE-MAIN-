export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: Request) {
  try {
    console.log('GET /api/ecotrade/items - No auth required')
    
    // Fetch all items without authentication for now
    const items = await prisma.ecoTradeItem.findMany({
      include: {
        seller: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('Found items:', items.length)
    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error('Items fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
