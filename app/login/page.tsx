"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("signup")
  const [error, setError] = useState<string>("")

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  useEffect(() => {
    try {
      const u = authService.getUser()
      setCurrentUserEmail(u?.email ?? null)
    } catch {}
  }, [])

  async function postLocation() {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await fetch('/api/community/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          })
        } catch {}
      })
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "")
    const password = String(form.get("password") || "")
    
    try {
      await authService.login(email, password)
      await postLocation()
      router.push("/dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const displayName = String(form.get("displayName") || "")
    const email = String(form.get("email") || "")
    const city = String(form.get("city") || "")
    const state = String(form.get("state") || "")
    const password = String(form.get("password") || "")
    
    // Validate required fields
    if (!displayName || !email || !city || !state || !password) {
      setError("Please fill in all required fields.")
      return
    }

    try {
      await authService.signup({
        displayName,
        email,
        city,
        state,
        password
      })

      await postLocation()
      router.push("/dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed")
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-120px)] w-full max-w-lg place-items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-2">
          {currentUserEmail && (
            <div className="mb-2 flex items-center justify-between rounded-md border bg-amber-50 p-3 text-sm">
              <div>
                You are signed in as <span className="font-medium">{currentUserEmail}</span>.
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { authService.logout(); setCurrentUserEmail(null) }}>Sign out</Button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={tab === "login" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("login")}
              className={tab === "login" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Log in
            </Button>
            <Button
              variant={tab === "signup" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("signup")}
              className={tab === "signup" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Create account
            </Button>
          </div>
          <CardTitle>{tab === "login" ? "Welcome back" : "Join ReCircle"}</CardTitle>
          <CardDescription>
            {tab === "login" ? "Access your circular journey" : "Start your community impact today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {tab === "login" ? (
            <form className="grid gap-4" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Continue
              </Button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Full name</Label>
                <Input id="displayName" name="displayName" required placeholder="Alex Green" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required placeholder="Portland" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required placeholder="OR" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
