export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const withUserId = params.userId
    if (!withUserId) return NextResponse.json({ message: 'userId required' }, { status: 400 })

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { fromUserId: decoded.userId, toUserId: withUserId },
          { fromUserId: withUserId, toUserId: decoded.userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Chat history error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


