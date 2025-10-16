import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Track item view
export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { itemId, itemName, itemCategory, viewDuration } = await req.json()

    // Validate required fields
    if (!itemId || !itemName) {
      return NextResponse.json({ message: 'Item ID and name are required' }, { status: 400 })
    }

    // Create item view record
    const view = await prisma.itemView.create({
      data: {
        userId: decoded.userId,
        itemId,
        itemName,
        itemCategory: itemCategory || 'general',
        viewDuration: viewDuration || 0
      }
    })

    return NextResponse.json({
      message: 'Item view recorded successfully!',
      view: {
        id: view.id,
        itemName: view.itemName,
        viewDuration: view.viewDuration,
        createdAt: view.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Item view error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Get user's item views
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user's item views
    const views = await prisma.itemView.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 views
    })

    // Get view summary by category
    const summary = await prisma.itemView.groupBy({
      by: ['itemCategory'],
      where: { userId: decoded.userId },
      _count: { id: true },
      _sum: { viewDuration: true }
    })

    return NextResponse.json({
      views,
      summary: summary.map(item => ({
        category: item.itemCategory,
        count: item._count.id,
        totalViewDuration: item._sum.viewDuration || 0
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('Get item views error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
