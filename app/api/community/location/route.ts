export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { latitude, longitude, city, state } = await req.json()
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ message: 'latitude and longitude are required' }, { status: 400 })
    }

    // Determine city/state if not provided (could call a geocoding API here). For now, keep existing.
    const me = await prisma.user.update({
      where: { id: decoded.userId },
      data: { locationLat: latitude, locationLng: longitude, city: city || undefined, state: state || undefined }
    })

    // Assign community by city: find or create Community with user's city
    if (me.city) {
      const community = await prisma.community.upsert({
        where: { name: me.city },
        update: {},
        create: { name: me.city }
      })
      await prisma.user.update({ where: { id: me.id }, data: { communityId: community.id } })
    }

    return NextResponse.json({ message: 'Location updated' }, { status: 200 })
  } catch (error) {
    console.error('Update location error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


