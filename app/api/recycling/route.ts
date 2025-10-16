import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Coin rewards based on material type and weight
const COIN_RATES = {
  paper: 2,    // 2 coins per kg
  plastic: 3,  // 3 coins per kg
  glass: 4,    // 4 coins per kg
  metal: 5,    // 5 coins per kg
  organic: 1   // 1 coin per kg
}

// CO2 savings per kg by material type
const CO2_SAVINGS = {
  paper: 0.8,    // 0.8 kg CO2 per kg
  plastic: 1.2,  // 1.2 kg CO2 per kg
  glass: 0.3,    // 0.3 kg CO2 per kg
  metal: 2.5,    // 2.5 kg CO2 per kg
  organic: 0.5   // 0.5 kg CO2 per kg
}

export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { material, weight, location, notes } = await req.json()

    // Validate required fields
    if (!material || !weight || weight <= 0) {
      return NextResponse.json({ message: 'Material and weight are required' }, { status: 400 })
    }

    if (!COIN_RATES[material as keyof typeof COIN_RATES]) {
      return NextResponse.json({ message: 'Invalid material type' }, { status: 400 })
    }

    // Calculate rewards
    const coinsEarned = Math.round(weight * COIN_RATES[material as keyof typeof COIN_RATES])
    const co2Saved = weight * CO2_SAVINGS[material as keyof typeof CO2_SAVINGS]

    // Create recycling activity
    const activity = await prisma.recyclingActivity.create({
      data: {
        userId: decoded.userId,
        material,
        weight,
        co2Saved,
        coinsEarned,
        location,
        notes
      }
    })

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ecoCoins: { increment: coinsEarned },
        totalRecycled: { increment: weight },
        co2Saved: { increment: co2Saved },
        isNewUser: false // User is no longer new after first recycling activity
      }
    })

    // Calculate new community rank based on total recycled
    const allUsers = await prisma.user.findMany({
      orderBy: { totalRecycled: 'desc' }
    })
    const newRank = allUsers.findIndex(user => user.id === decoded.userId) + 1

    // Update community rank
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { communityRank: newRank }
    })

    return NextResponse.json({
      message: 'Recycling activity recorded successfully!',
      activity: {
        id: activity.id,
        material: activity.material,
        weight: activity.weight,
        co2Saved: activity.co2Saved,
        coinsEarned: activity.coinsEarned,
        createdAt: activity.createdAt
      },
      userStats: {
        ecoCoins: updatedUser.ecoCoins,
        totalRecycled: updatedUser.totalRecycled,
        co2Saved: updatedUser.co2Saved,
        communityRank: newRank
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Recycling activity error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user's recycling activities
    const activities = await prisma.recyclingActivity.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 activities
    })

    // Get recycling breakdown by material
    const breakdown = await prisma.recyclingActivity.groupBy({
      by: ['material'],
      where: { userId: decoded.userId },
      _sum: { weight: true },
      _count: { id: true }
    })

    return NextResponse.json({
      activities,
      breakdown: breakdown.map(item => ({
        material: item.material,
        totalWeight: item._sum.weight || 0,
        count: item._count.id
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('Get recycling activities error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
