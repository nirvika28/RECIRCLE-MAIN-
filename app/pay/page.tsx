"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateUser } from "@/lib/user-storage"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function PayPage() {
  const params = useSearchParams()
  const router = useRouter()
  const purpose = params.get("purpose") || "Payment"
  const amount = Number(params.get("amount") || "0")
  const redirect = params.get("redirect") || "/"
  const membership = params.get("membership") // "gold" sets membership after payment

  const [processing, setProcessing] = useState(false)

  function complete() {
    setProcessing(true)
    setTimeout(() => {
      if (membership === "gold") updateUser({ isGold: true })
      // could also record event registration here
      setProcessing(false)
      router.push(redirect)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>{purpose}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3">
              <p>Amount</p>
              <p className="text-2xl font-semibold">₹{amount.toLocaleString()}</p>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={complete} disabled={processing}>
              {processing ? "Processing..." : "Pay with Card"}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
