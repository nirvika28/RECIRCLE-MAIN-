export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ message: 'event id required' }, { status: 400 })

    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 })

    const enrollment = await prisma.eventEnrollment.upsert({
      where: { eventId_userId: { eventId: id, userId: decoded.userId } },
      update: {},
      create: { eventId: id, userId: decoded.userId }
    })

    return NextResponse.json({ message: 'Enrolled', enrollment }, { status: 200 })
  } catch (error) {
    console.error('Enroll event error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


