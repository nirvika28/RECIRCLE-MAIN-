export const runtime = 'nodejs'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return NextResponse.json({}, { status: 200 })
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-09-30.acacia' as any })

    const payload = await req.text()
    const sig = (await import('next/headers')).headers().get('stripe-signature') as string
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentId = session.metadata?.paymentId
      if (paymentId) {
        const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status: 'paid', providerRef: session.id } })
        // Post-fulfillment
        if (payment.type === 'membership') {
          await prisma.membership.upsert({
            where: { userId: payment.userId },
            update: { tier: 'premium', active: true, renewsAt: new Date(Date.now() + 30*24*60*60*1000) },
            create: { userId: payment.userId, tier: 'premium', active: true, renewsAt: new Date(Date.now() + 30*24*60*60*1000) }
          })
        } else if (payment.type === 'event' && payment.referenceId) {
          await prisma.eventEnrollment.update({ where: { eventId_userId: { eventId: payment.referenceId, userId: payment.userId } }, data: { paid: true } })
        } else if (payment.type === 'item' && payment.referenceId) {
          await prisma.ecoTradeItem.update({ where: { id: payment.referenceId }, data: { status: 'sold' } })
          await prisma.wishlistItem.deleteMany({ where: { itemId: payment.referenceId } })
        }
      }
    }

    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({}, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'


