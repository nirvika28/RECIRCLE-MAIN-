export const runtime = 'nodejs'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string
const STRIPE_PRICE_MEMBERSHIP = process.env.STRIPE_PRICE_MEMBERSHIP // optional pre-created price

export async function POST(req: Request) {
  try {
    if (!STRIPE_SECRET_KEY) return NextResponse.json({ message: 'Stripe not configured' }, { status: 500 })
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-09-30.acacia' as any })

    const { userId, type, referenceId, title, amount, currency = 'INR' } = await req.json()
    if (!userId || !type) {
      return NextResponse.json({ message: 'userId and type required' }, { status: 400 })
    }

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        type,
        referenceId: referenceId || null,
        amount: amount ? Math.round(Number(amount)) : 0,
        currency,
        provider: 'stripe',
        providerRef: `temp_${crypto.randomUUID()}`,
        status: 'pending',
        metadata: { title }
      }
    })

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    if (STRIPE_PRICE_MEMBERSHIP && type === 'membership') {
      lineItems.push({ price: STRIPE_PRICE_MEMBERSHIP, quantity: 1 })
    } else if (amount && title) {
      lineItems.push({ price_data: { currency, product_data: { name: title }, unit_amount: Math.round(Number(amount)) * 100 }, quantity: 1 })
    } else {
      return NextResponse.json({ message: 'amount and title required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pay?success=1&pid=${payment.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pay?canceled=1&pid=${payment.id}`,
      metadata: { paymentId: payment.id, type, referenceId: referenceId || '' }
    })

    await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: session.id } })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


