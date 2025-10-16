import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Track marketplace activity (view, purchase, favorite, share)
export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { itemId, itemName, itemPrice, activityType, coinsSpent } = await req.json()

    // Validate required fields
    if (!itemId || !itemName || !activityType) {
      return NextResponse.json({ message: 'Item ID, name, and activity type are required' }, { status: 400 })
    }

    // Validate activity type
    const validActivityTypes = ['view', 'purchase', 'favorite', 'share']
    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json({ message: 'Invalid activity type' }, { status: 400 })
    }

    // For purchases, validate coins spent
    if (activityType === 'purchase' && (!coinsSpent || coinsSpent <= 0)) {
      return NextResponse.json({ message: 'Coins spent is required for purchases' }, { status: 400 })
    }

    // Check if user has enough coins for purchase
    if (activityType === 'purchase') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { ecoCoins: true }
      })

      if (!user || user.ecoCoins < coinsSpent) {
        return NextResponse.json({ message: 'Insufficient eco coins' }, { status: 400 })
      }
    }

    // Create marketplace activity
    const activity = await prisma.marketplaceActivity.create({
      data: {
        userId: decoded.userId,
        itemId,
        itemName,
        itemPrice: itemPrice || 0,
        activityType,
        coinsSpent: coinsSpent || 0
      }
    })

    // Update user's eco coins if it's a purchase
    let updatedUser = null
    if (activityType === 'purchase') {
      updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ecoCoins: { decrement: coinsSpent }
        }
      })
    }

    return NextResponse.json({
      message: 'Marketplace activity recorded successfully!',
      activity: {
        id: activity.id,
        itemName: activity.itemName,
        activityType: activity.activityType,
        coinsSpent: activity.coinsSpent,
        createdAt: activity.createdAt
      },
      userStats: updatedUser ? {
        ecoCoins: updatedUser.ecoCoins
      } : null
    }, { status: 201 })

  } catch (error) {
    console.error('Marketplace activity error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Get user's marketplace activities
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user's marketplace activities
    const activities = await prisma.marketplaceActivity.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 activities
    })

    // Get activity summary
    const summary = await prisma.marketplaceActivity.groupBy({
      by: ['activityType'],
      where: { userId: decoded.userId },
      _count: { id: true },
      _sum: { coinsSpent: true }
    })

    return NextResponse.json({
      activities,
      summary: summary.map(item => ({
        activityType: item.activityType,
        count: item._count.id,
        totalCoinsSpent: item._sum.coinsSpent || 0
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('Get marketplace activities error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
