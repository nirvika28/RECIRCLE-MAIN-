export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { toUserId, text } = await req.json()
    if (!toUserId || !text) return NextResponse.json({ message: 'toUserId and text required' }, { status: 400 })

    const [me, them] = await Promise.all([
      prisma.user.findUnique({ where: { id: decoded.userId }, include: { membership: true, community: true } }),
      prisma.user.findUnique({ where: { id: toUserId }, include: { community: true } })
    ])
    if (!me || !them) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    const myTier = me.membership?.tier || 'free'
    const sameCommunity = me.communityId && them.communityId && me.communityId === them.communityId
    if (myTier === 'free' && !sameCommunity) {
      return NextResponse.json({ message: 'Upgrade to premium to chat outside your community' }, { status: 403 })
    }

    const msg = await prisma.chatMessage.create({
      data: { fromUserId: me.id, toUserId, body: text }
    })
    return NextResponse.json({ message: 'Sent', msg }, { status: 201 })
  } catch (error) {
    console.error('Chat send error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


