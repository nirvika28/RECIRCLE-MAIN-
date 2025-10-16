"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loadUser, updateUser } from "@/lib/user-storage"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [state, setStateVal] = useState("")

  useEffect(() => {
    const u = loadUser()
    if (u) {
      setDisplayName(u.displayName || "")
      setCity(u.city || "")
      setStateVal(u.state || "")
    }
  }, [])

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    updateUser({ displayName, city, state: state })
    // Password is not persisted in this demo; hook to real auth as needed.
    toast({ title: "Saved", description: "Profile updated successfully." })
    router.refresh()
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your name, password, and location.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSave}>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state} onChange={(e) => setStateVal(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
