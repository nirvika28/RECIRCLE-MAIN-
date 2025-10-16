"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { events } from "../data"
import { loadUser } from "@/lib/user-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const e = useMemo(() => events.find((x) => x.id === id), [id])
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  if (!e) return null
  const user = loadUser()
  const isGold = !!user?.isGold
  const effectiveFee = e.paid && !isGold ? (e.fee ?? 0) : 0

  function onRSVP() {
    // call backend registration for free event
    fetch('/api/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ eventId: String(id), free: true, title: e.title })
    }).finally(() => setRsvpOpen(true))
  }

  function onPaid() {
    setPayOpen(true)
  }

  function finish() {
    setRsvpOpen(false)
    setPayOpen(false)
    // after payment, notify backend as paid registration
    if (effectiveFee > 0) {
      fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ eventId: String(id), paid: true, title: e.title })
      }).finally(() => router.push('/dashboard/events'))
    } else {
      router.push('/dashboard/events')
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative h-72 w-full">
            <Image
              src={e.cover?.startsWith('/') ? e.cover : (e.cover?.startsWith('http') ? e.cover : "/placeholder.svg")}
              alt={e.title}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{e.title}</CardTitle>
            <CardDescription>
              {e.date} • {e.where}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{e.description}</p>
            <div className="rounded-md border p-3">
              <p className="text-sm">
                Entry Fee: {effectiveFee === 0 ? "Free" : `₹${effectiveFee}`}{" "}
                {isGold && e.paid ? "(Gold benefit applied)" : ""}
              </p>
            </div>
            {effectiveFee > 0 ? (
              <Button className="bg-green-600 hover:bg-green-700" onClick={onPaid}>
                Pay Now
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={onRSVP}>
                RSVP
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RSVP Success Popup */}
      <Dialog open={rsvpOpen} onOpenChange={setRsvpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You've registered!</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your registered email.
            </p>
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700" onClick={finish}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">Amount: ₹{effectiveFee}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPayOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={finish}>
                Pay Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
