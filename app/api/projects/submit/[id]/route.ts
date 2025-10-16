export const runtime = 'nodejs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ message: 'Project id required' }, { status: 400 })

    const authHeader = (await import('next/headers')).headers().get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { proofUrl, note, sharedLinks } = await req.json()

    const project = await prisma.communityProject.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.communityProjectSubmission.create({
        data: { projectId: id, userId: decoded.userId, proofUrl: proofUrl || null, note: note || null }
      })
      // Append shared links if provided
      if (Array.isArray(sharedLinks) && sharedLinks.length) {
        const current = (project.sharedLinks as any[]) || []
        const next = [...current, ...sharedLinks]
        await tx.communityProject.update({ where: { id }, data: { sharedLinks: next as unknown as any } })
      }
      await tx.user.update({ where: { id: decoded.userId }, data: { points: { increment: 10 } } })
    })

    return NextResponse.json({ message: 'Submission recorded and points awarded' }, { status: 200 })
  } catch (error) {
    console.error('Submit project error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


