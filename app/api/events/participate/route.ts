import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Coin rewards for different event types
const EVENT_COIN_REWARDS = {
  'community-cleanup': 50,
  'recycling-workshop': 30,
  'eco-education': 25,
  'tree-planting': 40,
  'sustainability-fair': 35,
  'default': 20
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

    const { eventId, eventName, eventType } = await req.json()

    // Validate required fields
    if (!eventId || !eventName) {
      return NextResponse.json({ message: 'Event ID and name are required' }, { status: 400 })
    }

    // Check if user already participated in this event
    const existingParticipation = await prisma.eventParticipation.findFirst({
      where: {
        userId: decoded.userId,
        eventId: String(eventId)
      }
    })

    if (existingParticipation) {
      return NextResponse.json({ message: 'You have already participated in this event' }, { status: 400 })
    }

    // Calculate coins earned
    const coinsEarned = EVENT_COIN_REWARDS[eventType as keyof typeof EVENT_COIN_REWARDS] || EVENT_COIN_REWARDS.default

    // Create event participation
    const participation = await prisma.eventParticipation.create({
      data: {
        userId: decoded.userId,
        eventId: String(eventId),
        eventName,
        coinsEarned
      }
    })

    // Update user's eco coins
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ecoCoins: { increment: coinsEarned },
        isNewUser: false // User is no longer new after participating in events
      }
    })

    return NextResponse.json({
      message: 'Event participation recorded successfully!',
      participation: {
        id: participation.id,
        eventName: participation.eventName,
        coinsEarned: participation.coinsEarned,
        createdAt: participation.createdAt
      },
      userStats: {
        ecoCoins: updatedUser.ecoCoins
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Event participation error:', error)
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

    // Get user's event participations
    const participations = await prisma.eventParticipation.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Last 20 participations
    })

    return NextResponse.json({
      participations
    }, { status: 200 })

  } catch (error) {
    console.error('Get event participations error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
