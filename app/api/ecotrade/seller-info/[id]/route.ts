export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('GET /api/ecotrade/seller-info - Request received for seller:', params.id)
    
    // Get seller information by ID
    const seller = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        displayName: true,
        email: true,
        city: true,
        state: true
      }
    })

    if (!seller) {
      return NextResponse.json({ message: 'Seller not found' }, { status: 404 })
    }

    console.log('Seller found:', { id: seller.id, email: seller.email })
    return NextResponse.json(seller, { status: 200 })
  } catch (error) {
    console.error('Seller info fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
