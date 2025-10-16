import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      city: user.city,
      state: user.state,
      ecoCoins: user.ecoCoins,
      communityRank: user.communityRank,
      totalRecycled: user.totalRecycled,
      co2Saved: user.co2Saved,
      activeStreak: user.activeStreak,
      isNewUser: user.isNewUser,
      createdAt: user.createdAt
    }

    return NextResponse.json({ user: userResponse }, { status: 200 })

  } catch (error) {
    console.error('Profile error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
