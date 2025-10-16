import nodemailer from 'nodemailer'

export type EmailPayload = {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing')
  }

  const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
  await transporter.sendMail({ from: process.env.SMTP_FROM || user, ...payload })
}
