export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(_: Request, { params }: { params: { itemId: string } }) {
  try {
    const itemId = params.itemId
    if (!itemId) return NextResponse.json({ message: 'itemId required' }, { status: 400 })

    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)

    const item = await prisma.ecoTradeItem.findUnique({ where: { id: itemId } })
    if (!item || item.status !== 'active') return NextResponse.json({ message: 'Item not available' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.ecoTradeItem.update({ where: { id: itemId }, data: { status: 'sold' } })
      await tx.wishlistItem.deleteMany({ where: { itemId } })
    })

    return NextResponse.json({ message: 'Item purchased' }, { status: 200 })
  } catch (error) {
    console.error('Ecotrade buy error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


