export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

// Stub endpoint: in production, use Socket.io rooms or Firestore collections
export async function GET(_: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    if (!userId) return NextResponse.json({ message: 'userId required' }, { status: 400 })
    // Return empty list; frontend uses client-side storage or real-time service
    return NextResponse.json({ messages: [] }, { status: 200 })
  } catch (error) {
    console.error('Chat list error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
