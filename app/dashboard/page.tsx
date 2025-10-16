"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Recycle, Leaf, Clock, Settings, Sprout, Compass, Trophy, Trees, Coins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { Progress } from "@/components/ui/progress"
import { ImpactChart } from "@/components/impact-chart"
import { RecyclingChart } from "@/components/recycling-chart"
import { CommunityRankBadge } from "@/components/community-rank-badge"
import { authService, User } from "@/lib/auth-service"

export default function DashboardPage() {
  const router = useRouter()
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push("/login")
        return
      }

      try {
        // Try to get fresh user data from API
        const userData = await authService.getProfile()
        setUser(userData)
      } catch (error) {
        // If API fails, try to get cached user data
        const cachedUser = authService.getUser()
        if (cachedUser) {
          setUser(cachedUser)
        } else {
          // If no cached data, redirect to login
          router.push("/login")
          return
        }
      }
      setLoading(false)
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">No user data found</div>
        </div>
      </DashboardLayout>
    )
  }

  // Show zero values for new users
  const isNewUser = user.isNewUser
  const totalRecycled = isNewUser ? 0 : user.totalRecycled || 0
  const co2Saved = isNewUser ? 0 : user.co2Saved || 0
  const ecoCoins = isNewUser ? 0 : user.ecoCoins || 0
  const activeStreak = isNewUser ? 0 : user.activeStreak || 0
  const communityRank = isNewUser ? 0 : user.communityRank || 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {user.displayName ? `Hey ${user.displayName}!` : "Hey Recycler!"}
          </h1>
          <div className="flex items-center gap-3">
            <CommunityRankBadge rank={communityRank} />
            <Link href="/dashboard/settings" aria-label="Settings">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
              <Recycle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecycled.toFixed(1)} kg</div>
              <p className="text-xs text-green-600 mt-1">
                {isNewUser ? "Start your recycling journey!" : "+12.5% from last month"}
              </p>
              <Progress value={isNewUser ? 0 : 65} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Leaf className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{co2Saved.toFixed(1)} kg</div>
              <p className="text-xs text-green-600 mt-1">
                {isNewUser ? "Every action counts!" : "+8.3% from last month"}
              </p>
              <Progress value={isNewUser ? 0 : 42} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eco Coins</CardTitle>
              <Coins className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ecoCoins}</div>
              <p className="text-xs text-green-600 mt-1">
                {isNewUser ? "Earn your first coins!" : "+30 this week"}
              </p>
              <Progress value={isNewUser ? 0 : 56} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStreak} days</div>
              <p className="text-xs text-green-600 mt-1">
                {isNewUser ? "Build your streak!" : "Personal best!"}
              </p>
              <Progress value={isNewUser ? 0 : 70} className="h-1 mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-1">
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Your recycling and sustainability metrics over time</CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant={timeframe === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("week")}
                  className={timeframe === "week" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Week
                </Button>
                <Button
                  variant={timeframe === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("month")}
                  className={timeframe === "month" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Month
                </Button>
                <Button
                  variant={timeframe === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("year")}
                  className={timeframe === "year" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[360px]">
                <ImpactChart timeframe={timeframe} isNewUser={isNewUser} />
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recycling Breakdown</CardTitle>
              <CardDescription>Distribution of your recycled materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <RecyclingChart isNewUser={isNewUser} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Levels */}
        <div className="rounded-xl border">
          <div className="flex items-center gap-2 rounded-t-xl bg-green-700 px-4 py-3 text-white">
            <Leaf className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Sustainability Levels</h2>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            {/* Eco Learner */}
            <Card className="overflow-hidden">
              <img
                src="/recycling-bins-color-coded.jpg"
                alt="Color-coded recycling bins"
                className="h-40 w-full object-cover"
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sprout className="h-5 w-5 text-green-600" />
                  Eco Learner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Just getting started: learns to identify and segregate waste correctly with app guidance.
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-semibold text-yellow-800">
                  Reward: 10 coins
                </span>
              </CardContent>
            </Card>

            {/* Eco Explorer */}
            <Card className="overflow-hidden">
              <img
                src="/upcycling-donation-exchange.jpg"
                alt="Upcycling, donation and exchange concept"
                className="h-40 w-full object-cover"
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Compass className="h-5 w-5 text-green-600" />
                  Eco Explorer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Actively participates in recycling, upcycling, and begins donating or exchanging items.
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-semibold text-yellow-800">
                  Reward: 20 coins
                </span>
              </CardContent>
            </Card>

            {/* Eco Champion */}
            <Card className="overflow-hidden">
              <img
                src="/repair-workshop-hands-tools.jpg"
                alt="People repairing items at a workshop"
                className="h-40 w-full object-cover"
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Eco Champion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Consistently engages in sustainable habits, inspires peers, and earns high-impact eco-coin rewards.
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-semibold text-yellow-800">
                  Reward: 30 coins
                </span>
              </CardContent>
            </Card>

            {/* Eco Enabler */}
            <Card className="overflow-hidden">
              <img
                src="/forest-community-project.jpg"
                alt="Forest path representing community projects in nature"
                className="h-40 w-full object-cover"
              />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trees className="h-5 w-5 text-green-700" />
                  Eco Enabler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Drives change by contributing ideas, leading community projects, and mentoring others.
                </p>
                <span className="inline-flex w-fit items-center rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-semibold text-yellow-800">
                  Reward: 40 coins
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
