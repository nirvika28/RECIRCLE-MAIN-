export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'

// This is a simplified stub to mark payment success and send email.
// Integrate Stripe/Razorpay on the client to create a session/payment
// and call this endpoint after verification.
export async function POST(req: Request) {
  try {
    const { eventId, userId, email } = await req.json()
    if (!eventId || !userId || !email) {
      return NextResponse.json({ message: 'eventId, userId, email required' }, { status: 400 })
    }

    // Mark enrollment as paid
    const enrollment = await prisma.eventEnrollment.update({
      where: { eventId_userId: { eventId, userId } },
      data: { paid: true }
    })

    // Fetch event details for email
    const event = await prisma.event.findUnique({ where: { id: eventId } })

    if (event) {
      await sendEmail({
        to: email,
        subject: `Enrollment confirmed: ${event.title}`,
        html: `<p>You're enrolled in <strong>${event.title}</strong>.</p>
               <p>When: ${new Date(event.startsAt).toLocaleString()}</p>
               <p>Location: ${event.location}</p>`
      })
    }

    return NextResponse.json({ message: 'Payment processed and email sent', enrollment }, { status: 200 })
  } catch (error) {
    console.error('Payment endpoint error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}


