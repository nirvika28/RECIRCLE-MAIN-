"use client"

export async function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const anyWin = window as any
  if (anyWin.Razorpay) return true
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export type RazorpayOrderResponse = {
  orderId: string
  key: string
  amount: number
  currency: string
  paymentId: string
}

export async function createRazorpayOrder(payload: { userId: string; type: 'event'|'item'|'membership'; referenceId?: string; title: string; amount: number; currency?: string }): Promise<RazorpayOrderResponse> {
  const res = await fetch('/api/payments/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.message || 'Failed to create order')
  }
  return res.json()
}

export async function openRazorpayCheckout(params: { key: string; amount: number; currency: string; order_id: string; name: string; description?: string; prefill?: { name?: string; email?: string }; notes?: Record<string, string> }): Promise<void> {
  const ok = await loadRazorpay()
  if (!ok) throw new Error('Failed to load Razorpay')
  const anyWin = window as any
  const rzp = new anyWin.Razorpay({
    key: params.key,
    amount: params.amount,
    currency: params.currency,
    order_id: params.order_id,
    name: params.name,
    description: params.description || '',
    prefill: params.prefill,
    notes: params.notes,
  })
  rzp.open()
}
