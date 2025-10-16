export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Stub implementation using static clusters. In production, query DB by user coordinates
// and return clustered markers (e.g., using K-Means or Supercluster on server).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = Number(searchParams.get('lat'))
    const lng = Number(searchParams.get('lng'))
    const radiusKm = Number(searchParams.get('radiusKm') || 10)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ message: 'lat and lng required' }, { status: 400 })
    }

    // Query communities and compute centroid from member locations
    const communities = await prisma.community.findMany({ 
      include: { 
        users: { 
          select: { 
            id: true,
            displayName: true,
            locationLat: true, 
            locationLng: true 
          } 
        } 
      } 
    })
    const clusters = communities
      .map((c) => {
        const coords = c.users.filter(u => u.locationLat != null && u.locationLng != null) as Array<{ id: string; displayName: string; locationLat: number; locationLng: number }>
        if (!coords.length) return null
        const latAvg = coords.reduce((s, u) => s + (u.locationLat as number), 0) / coords.length
        const lngAvg = coords.reduce((s, u) => s + (u.locationLng as number), 0) / coords.length
        const memberNames = coords.map(u => u.displayName).slice(0, 5) // Limit to first 5 names to avoid overly large popups
        return { 
          id: c.id, 
          name: c.name, 
          lat: latAvg, 
          lng: lngAvg, 
          members: coords.length,
          memberNames: memberNames
        }
      })
      .filter(Boolean)

    return NextResponse.json({ clusters, radiusKm }, { status: 200 })
  } catch (error) {
    console.error('Map clusters error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


