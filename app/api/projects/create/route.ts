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

    const { title, description, sharedLinks } = await req.json()
    if (!title || !description) {
      return NextResponse.json({ message: 'Title and description are required' }, { status: 400 })
    }

    const project = await prisma.communityProject.create({
      data: {
        title,
        description,
        creatorId: decoded.userId,
        sharedLinks: Array.isArray(sharedLinks) ? sharedLinks : [],
      }
    })

    return NextResponse.json({ message: 'Project created', project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


