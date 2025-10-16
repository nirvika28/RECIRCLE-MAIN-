export const runtime = 'nodejs'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await import('next/headers')).headers().get('x-razorpay-signature') || ''
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (expected !== signature) return new NextResponse('Invalid signature', { status: 400 })

    const event = JSON.parse(body)
    if (event.event === 'payment.captured') {
      const entity = event.payload.payment.entity
      const orderId = entity.order_id as string
      // providerRef is the order id
      const payment = await prisma.payment.findFirst({ where: { providerRef: orderId, provider: 'razorpay' } })
      if (payment) {
        const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: 'paid' } })
        if (updated.type === 'membership') {
          await prisma.membership.upsert({ where: { userId: updated.userId }, update: { tier: 'premium', active: true, renewsAt: new Date(Date.now() + 30*24*60*60*1000) }, create: { userId: updated.userId, tier: 'premium', active: true, renewsAt: new Date(Date.now() + 30*24*60*60*1000) } })
        } else if (updated.type === 'event' && updated.referenceId) {
          await prisma.eventEnrollment.update({ where: { eventId_userId: { eventId: updated.referenceId, userId: updated.userId } }, data: { paid: true } })
        } else if (updated.type === 'item' && updated.referenceId) {
          await prisma.ecoTradeItem.update({ where: { id: updated.referenceId }, data: { status: 'sold' } })
          await prisma.wishlistItem.deleteMany({ where: { itemId: updated.referenceId } })
        }
      }
    }
    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({}, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'


