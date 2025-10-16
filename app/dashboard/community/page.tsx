"use client"

import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, MessageSquare, ShieldCheck, Crown, CreditCard } from "lucide-react"
import CommunityMap from "@/components/map"
import type { Cluster as MapCluster } from "@/components/map"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth-service"
import { createRazorpayOrder, openRazorpayCheckout } from "@/lib/razorpay"

type Member = { id: number; name: string; initials: string; avatar?: string }
type Cluster = { id: number; name: string; members: Member[]; position: { top: string; left: string } }

const CLUSTERS: Cluster[] = [
  {
    id: 1,
    name: "Koramangala Green Collective",
    members: [
      { id: 1, name: "Aarav Sharma", initials: "AS", avatar: "/portrait-sarah.jpg" },
      { id: 2, name: "Priya Reddy", initials: "PR", avatar: "/portrait-miguel.jpg" },
    ],
    position: { top: "30%", left: "25%" },
  },
  {
    id: 2,
    name: "Indiranagar Eco Warriors",
    members: [
      { id: 3, name: "Kavya Nair", initials: "KN", avatar: "/portrait-aisha.jpg" },
      { id: 4, name: "Rohan Kumar", initials: "RK", avatar: "/portrait-david.jpg" },
      { id: 5, name: "Ananya Iyer", initials: "AI", avatar: "/portrait-emma.jpg" },
    ],
    position: { top: "58%", left: "55%" },
  },
  {
    id: 3,
    name: "Whitefield Zero Waste",
    members: [
      { id: 6, name: "Arjun Desai", initials: "AD", avatar: "/portrait-james.jpg" },
      { id: 7, name: "Meera Patel", initials: "MP", avatar: "/portrait-priya.jpg" },
    ],
    position: { top: "68%", left: "18%" },
  },
]

export default function CommunityPage() {
  const router = useRouter()
  // Assume user's cluster is id=1 for this demo
  const myClusterId = 1

  // Membership state (read-only here; subscription page can set this in localStorage)
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

  const [tab, setTab] = useState("mine")
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)

  // Chat dialog state
  const [showChat, setShowChat] = useState(false)
  const [chatWith, setChatWith] = useState<Member | null>(null)
  const [messages, setMessages] = useState<{ from: "me" | "them"; text: string; at: string }[]>([
    { from: "them", text: "Hey! Welcome 👋", at: new Date().toLocaleTimeString() },
  ])
  const [draft, setDraft] = useState("")

  // Paywall dialog state
  const [showPaywall, setShowPaywall] = useState(false)
  const [pendingChatTarget, setPendingChatTarget] = useState<Member | null>(null)

  const myCommunityMembers = useMemo(() => {
    const c = CLUSTERS.find((c) => c.id === myClusterId)!
    return [{ id: 101, name: "You", initials: "U", avatar: "/abstract-self.png" }, ...c.members]
  }, [])

  function openChat(clusterId: number, member: Member) {
    const isOtherCluster = clusterId !== myClusterId
    if (isOtherCluster && !isGold) {
      setPendingChatTarget(member)
      setShowPaywall(true)
      return
    }
    // Open in-page chat dialog
    setChatWith(member)
    setShowChat(true)
  }

  function sendMessage() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { from: "me", text, at: new Date().toLocaleTimeString() }])
    setDraft("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "them", text: "Sounds good. Let’s coordinate!", at: new Date().toLocaleTimeString() },
      ])
    }, 800)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-sm text-muted-foreground">
              Connect with your cluster or explore other communities nearby.
            </p>
          </div>
          <Badge variant={isGold ? "default" : "outline"} className={isGold ? "bg-yellow-400 text-black" : ""}>
            {isGold ? "Gold Member" : "Free Member"}
          </Badge>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mine">My Community</TabsTrigger>
            <TabsTrigger value="others">Other Communities</TabsTrigger>
          </TabsList>

          {/* My Community: chat opens dialog directly */}
          <TabsContent value="mine" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Feed</CardTitle>
                <CardDescription>Share tips, organize events, and celebrate wins.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="What's new in your community?" className="min-h-[96px]" />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">Post Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Say hello to your fellow recyclers and upcyclers.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myCommunityMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={m.avatar || "/placeholder.svg"} alt={m.name} />
                        <AvatarFallback>{m.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">Active today</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openChat(myClusterId, m)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Communities: paywall if not gold */}
          <TabsContent value="others" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Communities</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Explore clusters on the map and connect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CommunityMap
                  height={320}
                  onClusterClick={(c: MapCluster) => {
                    // Treat clicked map cluster as another community; require premium
                    if (!isGold) {
                      setPendingChatTarget({ id: -1, name: c.name, initials: c.name.slice(0, 2).toUpperCase() })
                      setShowPaywall(true)
                      return
                    }
                    // If gold, navigate or open a chat stub
                    setChatWith({ id: -1, name: c.name, initials: c.name.slice(0, 2).toUpperCase() })
                    setShowChat(true)
                  }}
                />

                {selectedCluster ? (
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{selectedCluster.name}</h3>
                      <Badge variant="outline">{selectedCluster.members.length} members</Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {selectedCluster.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={m.avatar || "/placeholder.svg"} alt={m.name} />
                              <AvatarFallback>{m.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{m.name}</p>
                              <p className="text-xs text-muted-foreground">Bengaluru, Karnataka</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openChat(selectedCluster.id, m)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a cluster to view members.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Paywall Dialog (only when trying to chat with other clusters and not Gold) */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
              Get Premium
            </DialogTitle>
            <DialogDescription>
              Messaging across clusters is a Gold feature. Upgrade to unlock cross‑community chats and more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPaywall(false)}>
              Not now
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                try {
                  setShowPaywall(false)
                  const user = await authService.getProfile()
                  const order = await createRazorpayOrder({ userId: user.id, type: 'membership', title: 'Premium Membership', amount: 299 })
                  await openRazorpayCheckout({ key: order.key, amount: order.amount, currency: order.currency, order_id: order.orderId, name: 'ReCircle Premium', description: 'Upgrade to premium' })
                  alert('Payment window opened. After success, your membership upgrades to premium.')
                } catch (e: any) {
                  alert(e?.message || 'Payment init failed')
                }
              }}
            >
              <Crown className="mr-2 h-4 w-4" /> Buy Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              {chatWith ? `Chat with ${chatWith.name}` : "Chat"}
            </DialogTitle>
            <DialogDescription>Start a conversation and coordinate your next action.</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-md border p-3">
            {messages.map((m, i) => (
              <div
                key={`${m.at}-${i}`}
                className={cn(
                  "max-w-[80%] rounded-md px-3 py-2 text-sm",
                  m.from === "me" ? "ml-auto bg-green-600 text-white" : "mr-auto bg-muted",
                )}
              >
                <p>{m.text}</p>
                <p className="mt-1 text-[10px] opacity-70">{m.at}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button className="bg-green-600 hover:bg-green-700" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}
