export const runtime = 'nodejs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const { displayName, email, password, city, state } = await req.json()

    // Validate required fields
    if (!displayName || !email || !password || !city || !state) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = await prisma.user.create({
      data: {
        displayName,
        email,
        password: hashedPassword,
        city,
        state,
        ecoCoins: 0,
        communityRank: 0,
        totalRecycled: 0,
        co2Saved: 0,
        activeStreak: 0,
        isNewUser: true
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

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

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
