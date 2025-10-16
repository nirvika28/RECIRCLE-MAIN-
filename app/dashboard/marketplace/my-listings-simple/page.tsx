"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Edit, Trash2, Calendar } from "lucide-react"

export default function MyListingsSimplePage() {
  // Static mock data - no API calls
  const myListings = [
    {
      id: 'demo-1',
      title: 'Vintage Wooden Chair',
      description: 'Beautiful vintage wooden chair in excellent condition',
      price: 150,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: { displayName: 'You' }
    },
    {
      id: 'demo-2', 
      title: 'Test Item',
      description: 'This is the item you just submitted',
      price: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: { displayName: 'You' }
    }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your marketplace listings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Items</CardTitle>
                <CardDescription>Items you've listed in the marketplace</CardDescription>
              </div>
              <Link href="/dashboard/marketplace/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  List New Item
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {myListings.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-green-600">₹{item.price}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Listed {formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/dashboard/marketplace/${item.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
