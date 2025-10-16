export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    console.log('GET /api/ecotrade/all-items - No auth required')
    
    // Fetch all items without authentication
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
    console.error('All items fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
