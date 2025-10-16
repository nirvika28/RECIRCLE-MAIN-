export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    // Route handlers don't receive req headers here; use workaround by throwing unauthorized if needed
    // This route expects Authorization Bearer from middleware/edge or client fetch with credentials
    const id = params.id
    if (!id) return NextResponse.json({ message: 'Project id required' }, { status: 400 })

    // In Next 15 route handlers, we can access headers via global
    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Ensure project exists
    const project = await prisma.communityProject.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 })

    // Create participation (unique on user+project)
    await prisma.communityProjectParticipation.create({
      data: { projectId: id, userId: decoded.userId }
    })

    // Increment project participants and user points
    const [updatedProject, updatedUser] = await Promise.all([
      prisma.communityProject.update({ where: { id }, data: { participants: { increment: 1 } } }),
      prisma.user.update({ where: { id: decoded.userId }, data: { points: { increment: 5 } } })
    ])

    return NextResponse.json({
      message: 'Participation recorded',
      project: { id: updatedProject.id, participants: updatedProject.participants },
      user: { points: updatedUser.points }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Participate project error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Already participated' }, { status: 400 })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


