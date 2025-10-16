"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { loadUser, updateUser } from "@/lib/user-storage"
import { authService } from "@/lib/auth-service"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NewListingPage() {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [category, setCategory] = useState("Furniture")
  const [condition, setCondition] = useState("Used")
  const [desc, setDesc] = useState("")
  const [boost, setBoost] = useState(false)
  const [ecoCoins, setEcoCoins] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Add form validation state
  const isFormValid = title.trim() && desc.trim() && price > 0
  
  // Debug form validation
  console.log('Form validation debug:', {
    title: title.trim(),
    desc: desc.trim(), 
    price,
    isFormValid,
    titleLength: title.trim().length,
    descLength: desc.trim().length,
    priceType: typeof price
  })

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const u = loadUser()
    setEcoCoins(u?.ecoCoins ?? 0)
  }, [])

  async function submit() {
    console.log('Submit function called')
    console.log('Form data:', { title, desc, price, category, condition })
    
    if (!title.trim() || !desc.trim() || price <= 0) {
      console.log('Validation failed:', { title: title.trim(), desc: desc.trim(), price })
      toast({ title: "Error", description: "Please fill in all required fields with valid values." })
      return
    }

    setIsSubmitting(true)
    console.log('Starting submission process...')

    try {
      console.log('Submitting item:', { title, description: desc, price })

      // Submit to database (no authentication required)
      const response = await fetch('/api/ecotrade/item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
          price: Number(price)
        })
      })

      const responseData = await response.json()
      console.log('API Response:', { status: response.status, data: responseData })

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`)
      }

      console.log('Item created successfully, handling boost...')

      // Handle boost if selected
      let coinsLeft = ecoCoins
      if (boost) {
        const cost = 20
        coinsLeft = Math.max(0, ecoCoins - cost)
        updateUser({ ecoCoins: coinsLeft })
        setEcoCoins(coinsLeft)
        console.log('Boost applied, coins left:', coinsLeft)
      }

      toast({ title: "Item listed", description: boost ? "Boost applied using EcoCoins." : "Your item was listed successfully." })
      console.log('Redirecting to my-listings...')
      router.push("/dashboard/marketplace/my-listings")
    } catch (error) {
      console.error('Error listing item:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to list item. Please try again."
      toast({ title: "Error", description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-3xl">
        <Card>
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>List an Item</CardTitle>
              <CardDescription>Share your pre-loved item with the community marketplace.</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              EcoCoins: {ecoCoins}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wooden chair" />
            </div>
            <div className="grid gap-2">
              <Label>Price (₹)</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select defaultValue={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Household">Household</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select defaultValue={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description" />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Boost with EcoCoins</p>
                <p className="text-xs text-muted-foreground">Spend 20 EcoCoins to promote your listing.</p>
              </div>
              <Switch checked={boost} onCheckedChange={setBoost} />
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Form Validation Status:</h4>
              <div className="text-sm text-yellow-700">
                <div>Title: {title.trim() ? '✅' : '❌'} ({title.trim().length} chars)</div>
                <div>Description: {desc.trim() ? '✅' : '❌'} ({desc.trim().length} chars)</div>
                <div>Price: {price > 0 ? '✅' : '❌'} (₹{price})</div>
                <div className="font-semibold mt-1">Form Valid: {isFormValid ? '✅ YES' : '❌ NO'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  console.log('Test button clicked!')
                  alert('Test button works!')
                }}
              >
                Test Button
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  console.log('Checking authentication...')
                  try {
                    const token = authService.getToken()
                    const user = authService.getUser()
                    const localUser = loadUser()
                    
                    console.log('Auth check:', { 
                      hasToken: !!token, 
                      hasUser: !!user, 
                      hasLocalUser: !!localUser 
                    })
                    
                    if (!token) {
                      alert('No auth token found! Please log in first.')
                      return
                    }
                    
                    const response = await fetch('/api/ecotrade/my-listings', {
                      headers: { 'Authorization': `Bearer ${token}` },
                    })
                    
                    const data = await response.json()
                    console.log('My listings check:', data)
                    alert(`Found ${data.items?.length || 0} listings`)
                  } catch (error) {
                    console.error('Check listings error:', error)
                    alert('Error checking listings: ' + error)
                  }
                }}
              >
                Check My Listings
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  console.log('Auth debug info:')
                  const token = authService.getToken()
                  const user = authService.getUser()
                  const localUser = loadUser()
                  
                  console.log('Token:', token ? 'Present' : 'Missing')
                  console.log('User:', user)
                  console.log('Local User:', localUser)
                  
                  alert(`Auth Status:\nToken: ${token ? 'Present' : 'Missing'}\nUser: ${user ? 'Present' : 'Missing'}\nLocal User: ${localUser ? 'Present' : 'Missing'}`)
                }}
              >
                Debug Auth
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={() => {
                  console.log('Submit button clicked!')
                  console.log('Form valid:', isFormValid)
                  console.log('Is submitting:', isSubmitting)
                  submit()
                }}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
