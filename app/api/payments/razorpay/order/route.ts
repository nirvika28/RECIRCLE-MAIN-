export const runtime = 'nodejs'
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId, type, referenceId, title, amount, currency = 'INR' } = await req.json()
    if (!userId || !type || !amount) {
      return NextResponse.json({ message: 'userId, type, amount required' }, { status: 400 })
    }

    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) return NextResponse.json({ message: 'Razorpay not configured' }, { status: 500 })

    const rzp = new (Razorpay as any)({ key_id, key_secret })

    // amount in paise
    const order = await rzp.orders.create({ amount: Math.round(Number(amount)) * 100, currency, receipt: `rcpt_${Date.now()}`, notes: { title, type, referenceId: referenceId || '' } })

    const payment = await prisma.payment.create({
      data: {
        userId,
        type,
        referenceId: referenceId || null,
        amount: Math.round(Number(amount)),
        currency,
        provider: 'razorpay',
        providerRef: order.id,
        status: 'pending',
        metadata: { title }
      }
    })

    return NextResponse.json({ orderId: order.id, key: key_id, amount: order.amount, currency: order.currency, paymentId: payment.id }, { status: 200 })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


