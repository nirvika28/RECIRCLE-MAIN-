"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecyclingChart } from "@/components/recycling-chart"
import DashboardLayout from "@/components/dashboard-layout"
import RecyclingForm from "@/components/recycling-form"
import { authService } from "@/lib/auth-service"
import { Recycle, Award, ChevronRight, Coins, Leaf } from "lucide-react"

type RecyclingActivity = {
  id: string
  material: string
  weight: number
  co2Saved: number
  coinsEarned: number
  createdAt: string
}

type UserStats = {
  ecoCoins: number
  totalRecycled: number
  co2Saved: number
  communityRank: number
}

const MATERIAL_LABELS: Record<string, string> = {
  paper: "Paper",
  plastic: "Plastic",
  glass: "Glass",
  metal: "Metal",
  organic: "Organic",
}

export default function RecyclingPage() {
  const [selectedTab, setSelectedTab] = useState("log")
  const [activities, setActivities] = useState<RecyclingActivity[]>([])
  const [breakdown, setBreakdown] = useState<{ name: string; value: number }[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadRecyclingData = async () => {
    try {
      const token = authService.getToken()
      if (!token) return

      const response = await fetch('/api/recycling', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActivities((data.activities || []).map((activity: any) => ({
          ...activity,
          weight: activity.weight || 0,
          co2Saved: activity.co2Saved || 0,
          coinsEarned: activity.coinsEarned || 0
        })))
        setBreakdown((data.breakdown || []).map((item: any) => ({
          ...item,
          value: item.value || 0
        })))
      }
    } catch (error) {
      console.error('Error loading recycling data:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      const user = await authService.getProfile()
      setUserStats({
        ecoCoins: user.ecoCoins || 0,
        totalRecycled: user.totalRecycled || 0,
        co2Saved: user.co2Saved || 0,
        communityRank: user.communityRank || 0
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadRecyclingData(), loadUserStats()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleRecyclingSubmitted = () => {
    // Refresh data after new recycling activity
    loadRecyclingData()
    loadUserStats()
    setSelectedTab("history")
  }

  // Get current month activities
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`
  const monthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.createdAt)
    return `${activityDate.getFullYear()}-${activityDate.getMonth()}` === monthKey
  })

  const totalThisMonth = monthActivities.reduce((sum, activity) => sum + (activity.weight || 0), 0)
  const coinsThisMonth = monthActivities.reduce((sum, activity) => sum + (activity.coinsEarned || 0), 0)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">EcoSort</h1>
          {userStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">{userStats.ecoCoins} coins</span>
              </div>
              <div className="flex items-center gap-1">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="font-medium">{userStats.co2Saved.toFixed(1)} kg CO₂</span>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="log" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Log Recycling</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">My Stats</TabsTrigger>
          </TabsList>

          {/* LOG TAB */}
          <TabsContent value="log" className="mt-6">
            <RecyclingForm onSubmitted={handleRecyclingSubmitted} />
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recycling History</CardTitle>
                  <CardDescription>Material breakdown for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px]">
                    <RecyclingChart data={breakdown.length ? breakdown : undefined} />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest recycling logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : monthActivities.length === 0 ? (
                      <div className="text-sm text-gray-500">No activity yet this month.</div>
                    ) : (
                      monthActivities.slice(0, 8).map((activity) => {
                        const date = new Date(activity.createdAt)
                        return (
                          <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{MATERIAL_LABELS[activity.material] || activity.material}</p>
                              <p className="text-sm text-gray-500">{date.toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{(activity.weight || 0).toFixed(1)} kg</span>
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <Coins className="h-3 w-3" />
                                {activity.coinsEarned || 0}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* STATS TAB */}
          <TabsContent value="stats" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
                  <Recycle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.totalRecycled.toFixed(1) || 0} kg</div>
                  <p className="text-xs text-muted-foreground">
                    This month: {totalThisMonth.toFixed(1)} kg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eco Coins</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.ecoCoins || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Earned this month: {coinsThisMonth}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.co2Saved.toFixed(1) || 0} kg</div>
                  <p className="text-xs text-muted-foreground">
                    Environmental impact
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#{userStats?.communityRank || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Among all users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Material Breakdown */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Material Breakdown</CardTitle>
                <CardDescription>Your recycling by material type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {breakdown.length === 0 ? (
                    <div className="text-sm text-gray-500">No recycling data yet.</div>
                  ) : (
                    breakdown.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{(item.value || 0).toFixed(1)} kg</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}