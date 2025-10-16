"use client"

import { useMemo } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import Image from "next/image"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, MessageSquare } from "lucide-react"
import Link from "next/link"
import { sendMessage } from "@/lib/chat-storage"

const LISTINGS = [
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

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id) // Convert URL param to number

  // Find the listing that matches the id
  const item = useMemo(() => LISTINGS.find((l) => l.id === id), [id])
  if (!item) return notFound() // Show 404 if item not found

  async function consider() {
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
      router.push(chatUrl)
    } catch (error) {
      console.error('Error getting seller info:', error)
      // Fallback to default email
      const sellerEmail = `${item.sellerName.toLowerCase().replace(/\s+/g, '')}@example.com`
      const chatUrl = `/dashboard/marketplace/chats?seller=${encodeURIComponent(item.sellerName)}&item=${encodeURIComponent(item.title)}&price=${item.price}&email=${encodeURIComponent(sellerEmail)}`
      router.push(chatUrl)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
        {/* Image */}
        <Card className="overflow-hidden">
          <div className="relative h-72 w-full">
            <Image
              src={item.img || "/placeholder.svg"}
              alt={item.title}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2 text-base">
                  <span className="font-semibold text-green-700">₹{item.price.toLocaleString()}</span>
                  <Badge variant="secondary" className="bg-emerald-600/90 text-white">
                    Eco Score: {item.ecoScore.toFixed(1)}
                  </Badge>
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {item.distanceKm} km
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                Lightly used. Great condition. Pick-up preferred. Cash or UPI.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Specifications</h3>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                <li>Seller: {item.sellerName}</li>
                <li>Condition: {item.condition}</li>
                <li>Category: {item.category}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="bg-green-600 hover:bg-green-700" onClick={consider}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Seller
              </Button>

              <Link href="/dashboard/marketplace" className="sm:ml-2">
                <Button variant="outline" className="w-full bg-transparent sm:w-auto">
                  Back to listings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
