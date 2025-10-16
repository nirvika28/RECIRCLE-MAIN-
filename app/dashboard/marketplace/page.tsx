"use client"
import { sendMessage } from "@/lib/chat-storage.ts" 
import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, SlidersHorizontal, MapPin, ShoppingCart, Heart, MessageSquare, Coins, Eye, CreditCard } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { loadWishlist, toggleWishlist } from "@/lib/wishlist"
import { createRazorpayOrder, openRazorpayCheckout } from "@/lib/razorpay"
import { authService } from "@/lib/auth-service"

type Listing = {
  id: number | string
  title: string
  price: number
  condition: "Like New" | "Used" | "Refurbished"
  category: "Furniture" | "Electronics" | "Household" | "Sports"
  ecoScore: number
  img: string
  distanceKm: number
  sellerId: string
  sellerName: string
}

type DatabaseListing = {
  id: string
  title: string
  description: string
  price: number
  status: string
  sellerId: string
  seller: {
    displayName: string
  }
}

const LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Vintage Wooden Chair",
    price: 150,
    condition: "Used",
    category: "Furniture",
    ecoScore: 8.2,
    img: "/glass-storage-jars.jpg",
    distanceKm: 3,
    sellerId: "s1",
    sellerName: "Maya",
  },
  {
    id: 2,
    title: "Refurbished Laptop",
    price: 2500,
    condition: "Refurbished",
    category: "Electronics",
    ecoScore: 8.5,
    img: "/refurbished-blender.jpg",
    distanceKm: 9,
    sellerId: "s2",
    sellerName: "Arun",
  },
  {
    id: 3,
    title: "Wooden Bookshelf",
    price: 800,
    condition: "Used",
    category: "Furniture",
    ecoScore: 7.8,
    img: "/bike-rack.jpg",
    distanceKm: 16,
    sellerId: "s3",
    sellerName: "Lee",
  },
  {
    id: 4,
    title: "Worm Composting Bin",
    price: 25,
    condition: "Used",
    category: "Household",
    ecoScore: 7.1,
    img: "/composting-bin.jpg",
    distanceKm: 25,
    sellerId: "s4",
    sellerName: "Aisha",
  },
]

const CONDITIONS = ["All Conditions", "Like New", "Used", "Refurbished"] as const
const CATEGORIES = ["All Categories", "Furniture", "Electronics", "Household", "Sports"] as const

export default function MarketplacePage() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All Categories")
  const [condition, setCondition] = React.useState<(typeof CONDITIONS)[number]>("All Conditions")
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 3000])
  const [radiusKm, setRadiusKm] = React.useState<number>(20)
  const [wishlist, setWishlist] = React.useState<Set<number>>(new Set())
  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dbListings, setDbListings] = useState<DatabaseListing[]>([])
  const [allListings, setAllListings] = useState<Listing[]>(LISTINGS)

  React.useEffect(() => {
    setWishlist(loadWishlist())
    loadUserCoins()
    loadDatabaseListings()
  }, [])

  // Refresh listings when page becomes visible (after returning from listing page)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDatabaseListings()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadDatabaseListings = async () => {
    try {
      const response = await fetch('/api/ecotrade/items')
      if (response.ok) {
        const data = await response.json()
        
        // Get current user to filter out their own listings
        let currentUserId = null
        try {
          const user = await authService.getProfile()
          currentUserId = user.id
        } catch (error) {
          console.log('No user profile found, showing all listings')
        }
        
        const dbItems: Listing[] = data.items
          .filter((item: DatabaseListing) => {
            // Hide user's own listings
            if (currentUserId && item.sellerId === currentUserId) {
              return false
            }
            return true
          })
          .map((item: DatabaseListing) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            condition: "Used" as const, // Default condition since it's not in the schema yet
            category: "Household" as const, // Default category since it's not in the schema yet
            ecoScore: 7.5, // Default eco score
            img: "/placeholder.svg", // Default image since imageURL is not in the schema yet
            distanceKm: Math.floor(Math.random() * 25) + 1, // Random distance for demo
            sellerId: item.sellerId,
            sellerName: item.seller.displayName
          }))
        setDbListings(data.items)
        setAllListings([...LISTINGS, ...dbItems])
      } else {
        console.log('API failed, using static listings only')
        setAllListings(LISTINGS)
      }
    } catch (error) {
      console.error('Error loading database listings:', error)
      setAllListings(LISTINGS)
    }
  }

  const loadUserCoins = async () => {
    try {
      const user = await authService.getProfile()
      setUserCoins(user.ecoCoins || 0)
    } catch (error) {
      console.error('Error loading user coins:', error)
    }
  }

  const trackItemView = async (item: Listing) => {
    try {
      const token = authService.getToken()
      if (!token) return

      await fetch('/api/marketplace/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.id.toString(),
          itemName: item.title,
          itemCategory: item.category.toLowerCase(),
          viewDuration: 5 // Default 5 seconds for now
        })
      })
    } catch (error) {
      console.error('Error tracking item view:', error)
    }
  }

  const trackMarketplaceActivity = async (item: Listing, activityType: 'view' | 'purchase' | 'favorite' | 'share', coinsSpent?: number) => {
    try {
      const token = authService.getToken()
      if (!token) return

      await fetch('/api/marketplace/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.id.toString(),
          itemName: item.title,
          itemPrice: item.price,
          activityType,
          coinsSpent: coinsSpent || 0
        })
      })

      // Refresh user coins if it was a purchase
      if (activityType === 'purchase') {
        await loadUserCoins()
      }
    } catch (error) {
      console.error('Error tracking marketplace activity:', error)
    }
  }

  const handlePurchase = async (item: Listing) => {
    if (confirm(`Contact seller about ${item.title} for ₹${item.price}?`)) {
      setLoading(true)
      try {
        // Get actual seller email from database
        let sellerEmail = `${item.sellerName.toLowerCase().replace(/\s+/g, '')}@example.com` // Default fallback
        
        try {
          // Try to get seller's actual email from the database
          const sellerResponse = await fetch(`/api/ecotrade/seller-info/${item.sellerId}`)
          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json()
            sellerEmail = sellerData.email || sellerEmail
          }
        } catch (error) {
          console.log('Could not fetch seller email, using default')
        }
        
        const chatUrl = `/dashboard/marketplace/chats?seller=${encodeURIComponent(item.sellerName)}&item=${encodeURIComponent(item.title)}&price=${item.price}&email=${encodeURIComponent(sellerEmail)}`
        
        // Track the purchase intent
        await trackMarketplaceActivity(item, 'purchase')
        
        // Redirect to chat
        window.location.href = chatUrl
      } catch (error: any) {
        alert(error?.message || 'Failed to connect to seller')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFavorite = async (item: Listing) => {
    const newWishlist = toggleWishlist(item.id)
    setWishlist(newWishlist)
    
    // Track favorite activity
    await trackMarketplaceActivity(item, 'favorite')
  }
  const handleMessageSeller = async (item: Listing) => {
    try {
      // Send a default "interested in inspection" message
      await sendMessage(item.sellerId, item.sellerName, `Hi ${item.sellerName}, I'm interested in inspecting "${item.title}".`)
      // Redirect to chat page
      window.location.href = `/dashboard/marketplace/chats?with=${item.sellerId}&name=${encodeURIComponent(item.sellerName)}`
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to start chat. Please try again.")
    }
  }
  const handleShare = async (item: Listing) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out this item on ReCircle: ${item.title}`,
          url: window.location.href
        })
        await trackMarketplaceActivity(item, 'share')
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${item.title} - ${window.location.href}`)
      await trackMarketplaceActivity(item, 'share')
      alert('Link copied to clipboard!')
    }
  }

  const filtered = React.useMemo(() => {
    return allListings.filter((l) => {
      const matchesQuery = l.title.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === "All Categories" ? true : l.category === category
      const matchesCondition = condition === "All Conditions" ? true : l.condition === condition
      const matchesPrice = l.price >= priceRange[0] && l.price <= priceRange[1]
      const matchesRadius = l.distanceKm <= radiusKm
      return matchesQuery && matchesCategory && matchesCondition && matchesPrice && matchesRadius
    })
  }, [query, category, condition, priceRange, radiusKm, allListings])

  function onToggleWishlist(id: number) {
    const next = toggleWishlist(id)
    setWishlist(new Set(next))
    
    // Track favorite activity
    const item = allListings.find(l => l.id === id)
    if (item) {
      trackMarketplaceActivity(item, 'favorite')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col-reverse items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">EcoTrade</h1>
            <p className="text-sm text-muted-foreground">
              Buy, sell, and swap pre-loved items in your local marketplace.
            </p>
            <div className="mt-2">
              <Link href="/dashboard/marketplace/my-listings" className="text-sm text-blue-600 hover:text-blue-800">
                📦 View your own listings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="font-medium">{userCoins} eco coins</span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link href="/dashboard/marketplace/chats" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-transparent sm:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" />
                My Chats
              </Button>
            </Link>
            <Button variant="outline" className="w-full bg-transparent sm:w-auto">
              Wishlist ({wishlist.size})
            </Button>
            <Link href="/dashboard/marketplace/my-listings" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full bg-transparent sm:w-auto">
             My Listings
                </Button>
             </Link>

            <Link href="/dashboard/marketplace/new" className="w-full sm:w-auto">
              <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">List Item</Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="grid gap-4 p-4 md:grid-cols-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Condition</label>
              <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Price Range</span>
                <span className="tabular-nums">
                  ₹{priceRange[0]} — ₹{priceRange[1]}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                min={0}
                max={3000}
                step={25}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Location Radius
                </span>
                <span className="tabular-nums">{radiusKm} km</span>
              </div>
              <Slider value={[radiusKm]} onValueChange={(v) => setRadiusKm(v[0])} min={1} max={50} step={1} />
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          {filtered.length} result{filtered.length === 1 ? "" : "s"} found
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Card key={l.id} className="overflow-hidden">
              <Link 
                href={`/dashboard/marketplace/${l.id}`} 
                className="block"
                onClick={() => trackItemView(l)}
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={l.img || "/placeholder.svg?height=160&width=320&query=eco%20marketplace%20item"}
                    alt={l.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-600/90 text-white">
                      Eco Score: {l.ecoScore.toFixed(1)}
                    </Badge>
                    {l.condition !== "Used" && (
                      <Badge variant="secondary" className="bg-blue-600/90 text-white">
                        {l.condition.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
              <CardHeader className="space-y-1">
                <CardTitle className="line-clamp-1 text-base">{l.title}</CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-700">₹{l.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <Coins className="h-3 w-3" />
                      <span>{l.price} coins</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    {l.distanceKm} km
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handlePurchase(l)}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Connecting...' : 'Contact Seller'}
                  </Button>
                  <Button
                    size="icon"
                    variant={wishlist.has(l.id) ? "default" : "secondary"}
                    className={`h-9 w-9 rounded-full ${wishlist.has(l.id) ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-white/90"}`}
                    aria-pressed={wishlist.has(l.id)}
                    onClick={() => onToggleWishlist(l.id)}
                  >
                    <Heart className={`h-4 w-4 ${wishlist.has(l.id) ? "fill-current" : "text-rose-500"}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/marketplace/${l.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Eye className="h-4 w-4" /> View Details
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full"
                    onClick={() => handleShare(l)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
