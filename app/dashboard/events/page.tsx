"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { events } from "./data"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth-service"
import { Coins, CheckCircle } from "lucide-react"

export default function EventsPage() {
  const [participatedEvents, setParticipatedEvents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Set<string>>(new Set())

  const handleParticipate = async (eventId: string, eventName: string, eventType: string) => {
    if (participatedEvents.has(eventId)) return

    setLoading(prev => new Set(prev).add(eventId))

    try {
      const token = authService.getToken()
      if (!token) {
        alert('Please log in to participate in events')
        return
      }

      const response = await fetch('/api/events/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          eventName,
          eventType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to participate in event')
      }

      setParticipatedEvents(prev => new Set(prev).add(eventId))
      
      // Refresh user data to update coins
      await authService.getProfile()

      alert(`Successfully joined ${eventName}! You earned ${data.participation.coinsEarned} coins!`)

    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const getEventType = (title: string): string => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('cleanup') || lowerTitle.includes('clean')) return 'community-cleanup'
    if (lowerTitle.includes('workshop')) return 'recycling-workshop'
    if (lowerTitle.includes('education') || lowerTitle.includes('learn')) return 'eco-education'
    if (lowerTitle.includes('tree') || lowerTitle.includes('plant')) return 'tree-planting'
    if (lowerTitle.includes('fair') || lowerTitle.includes('expo')) return 'sustainability-fair'
    return 'default'
  }

  const getCoinsForEvent = (eventType: string): number => {
    const rewards = {
      'community-cleanup': 50,
      'recycling-workshop': 30,
      'eco-education': 25,
      'tree-planting': 40,
      'sustainability-fair': 35,
      'default': 20
    }
    return rewards[eventType as keyof typeof rewards] || rewards.default
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground">Discover and join upcoming community events to earn eco coins!</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const eventType = getEventType(e.title)
            const coinsReward = getCoinsForEvent(eventType)
            const hasParticipated = participatedEvents.has(e.id)
            const isLoading = loading.has(e.id)

            return (
              <Card key={e.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image 
                    src={e.cover?.startsWith('/') ? e.cover : (e.cover?.startsWith('http') ? e.cover : "/placeholder.svg")} 
                    alt={e.title} 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  {hasParticipated && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{e.title}</CardTitle>
                  <CardDescription>
                    {e.date} • {e.where}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                  
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-1 text-sm text-yellow-700">
                      <Coins className="h-4 w-4" />
                      <span className="font-medium">{coinsReward} coins reward</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{e.attendees} attendees</span>
                    {hasParticipated ? (
                      <Button disabled className="bg-green-100 text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Participated
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleParticipate(e.id, e.title, eventType)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? 'Joining...' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}