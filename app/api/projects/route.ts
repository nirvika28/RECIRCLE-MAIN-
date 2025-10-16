import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Get all projects
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'active'

    // Build filter
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (status) {
      where.status = status
    }

    // Get projects with pledge counts
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pledges: {
          select: {
            pledgeAmount: true,
            pledgeType: true,
            createdAt: true
          }
        }
      }
    })

    // Calculate additional stats for each project
    const projectsWithStats = projects.map(project => {
      const totalPledges = project.pledges.length
      const totalAmount = project.pledges.reduce((sum, pledge) => sum + pledge.pledgeAmount, 0)
      const progressPercentage = Math.min(100, (totalAmount / project.goalAmount) * 100)
      
      // Count pledges by type
      const pledgeTypes = project.pledges.reduce((acc, pledge) => {
        acc[pledge.pledgeType] = (acc[pledge.pledgeType] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        ...project,
        totalPledges,
        totalAmount,
        progressPercentage,
        pledgeTypes
      }
    })

    return NextResponse.json({
      projects: projectsWithStats
    }, { status: 200 })

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
