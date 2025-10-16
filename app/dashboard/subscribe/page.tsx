"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SubscribePage() {
  const router = useRouter()
  const [isGold, setIsGold] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recircle:user")
      if (raw) {
        const u = JSON.parse(raw)
        setIsGold(!!u?.isGold)
      }
    } catch {
      // ignore
    }
  }, [])

  function activateGold() {
    try {
      const raw = localStorage.getItem("recircle:user")
      const u = raw ? JSON.parse(raw) : {}
      localStorage.setItem("recircle:user", JSON.stringify({ ...u, isGold: true }))
    } catch {
      // ignore
    }
    setIsGold(true)
    router.push("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free Member</CardTitle>
            <CardDescription>Start your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Join local clusters
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Post and RSVP free events
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> EcoTrade buy & sell
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" /> Gold Member
            </CardTitle>
            <CardDescription>₹99 / month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Enter paid events at ₹0
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Chat across clusters
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" /> Early access to projects
            </p>
            <Button className="mt-2 w-full bg-green-600 hover:bg-green-700" onClick={activateGold} disabled={isGold}>
              {isGold ? "Already Gold" : "Buy Gold"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
