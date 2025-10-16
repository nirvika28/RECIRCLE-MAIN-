import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Create a project pledge
export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { projectId, pledgeAmount, pledgeType, message } = await req.json()

    // Validate required fields
    if (!projectId || !pledgeAmount || !pledgeType) {
      return NextResponse.json({ message: 'Project ID, pledge amount, and pledge type are required' }, { status: 400 })
    }

    // Validate pledge type
    const validPledgeTypes = ['vote', 'donation', 'volunteer']
    if (!validPledgeTypes.includes(pledgeType)) {
      return NextResponse.json({ message: 'Invalid pledge type' }, { status: 400 })
    }

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    if (project.status !== 'active') {
      return NextResponse.json({ message: 'Project is not active' }, { status: 400 })
    }

    // Check if user already pledged to this project
    const existingPledge = await prisma.projectPledge.findFirst({
      where: {
        userId: decoded.userId,
        projectId: projectId,
        status: 'active'
      }
    })

    if (existingPledge) {
      return NextResponse.json({ message: 'You have already pledged to this project' }, { status: 400 })
    }

    // Create pledge
    const pledge = await prisma.projectPledge.create({
      data: {
        userId: decoded.userId,
        projectId,
        projectTitle: project.title,
        pledgeAmount,
        pledgeType,
        message
      }
    })

    console.log('Pledge created:', pledge.id, 'for project:', project.title)

    // Update project's current amount
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        currentAmount: { increment: pledgeAmount }
      }
    })

    console.log('Project updated:', updatedProject.title, 'new amount:', updatedProject.currentAmount)

    // Update user's eco coins if it's a donation
    let updatedUser = null
    if (pledgeType === 'donation' && pledgeAmount > 0) {
      // Check if user has enough coins
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { ecoCoins: true }
      })

      if (!user || user.ecoCoins < pledgeAmount) {
        // Cancel the pledge if insufficient coins
        await prisma.projectPledge.update({
          where: { id: pledge.id },
          data: { status: 'cancelled' }
        })
        await prisma.project.update({
          where: { id: projectId },
          data: {
            currentAmount: { decrement: pledgeAmount }
          }
        })
        return NextResponse.json({ message: 'Insufficient eco coins for donation' }, { status: 400 })
      }

      updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ecoCoins: { decrement: pledgeAmount }
        }
      })
    }

    return NextResponse.json({
      message: 'Pledge created successfully!',
      pledge: {
        id: pledge.id,
        projectTitle: pledge.projectTitle,
        pledgeAmount: pledge.pledgeAmount,
        pledgeType: pledge.pledgeType,
        message: pledge.message,
        createdAt: pledge.createdAt
      },
      userStats: updatedUser ? {
        ecoCoins: updatedUser.ecoCoins
      } : null
    }, { status: 201 })

  } catch (error) {
    console.error('Project pledge error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Get user's pledges
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user's pledges
    const pledges = await prisma.projectPledge.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            title: true,
            description: true,
            category: true,
            status: true,
            goalAmount: true,
            currentAmount: true
          }
        }
      }
    })

    // Get pledge summary by type
    const summary = await prisma.projectPledge.groupBy({
      by: ['pledgeType'],
      where: { userId: decoded.userId },
      _count: { id: true },
      _sum: { pledgeAmount: true }
    })

    return NextResponse.json({
      pledges,
      summary: summary.map(item => ({
        pledgeType: item.pledgeType,
        count: item._count.id,
        totalAmount: item._sum.pledgeAmount || 0
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('Get project pledges error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
