"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Mail, Phone, MapPin, User } from "lucide-react"

export default function SellerChatPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'buyer' | 'seller', timestamp: Date}>>([])
  const [newMessage, setNewMessage] = useState("")
  const [sellerInfo, setSellerInfo] = useState({
    name: "",
    email: "",
    item: "",
    price: 0
  })

  useEffect(() => {
    // Get seller info from URL parameters
    const seller = searchParams.get('seller') || 'Seller'
    const item = searchParams.get('item') || 'Item'
    const price = searchParams.get('price') || '0'
    const email = searchParams.get('email') || 'seller@example.com'
    
    setSellerInfo({
      name: seller,
      email: email,
      item: item,
      price: parseInt(price)
    })

    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        text: `Hi! I'm interested in your ${item} for ₹${price}. Is it still available?`,
        sender: 'buyer',
        timestamp: new Date()
      }
    ])
  }, [searchParams])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'buyer' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    // Simulate seller response after 2 seconds
    setTimeout(() => {
      const responses = [
        "Yes, it's still available!",
        "Great! When would you like to meet?",
        "The item is in excellent condition as described.",
        "I can meet you at [location] if that works for you.",
        "Cash on pickup works fine for me."
      ]
      
      const sellerResponse = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'seller' as const,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, sellerResponse])
    }, 2000)
  }

  const openEmail = () => {
    const subject = `ReCircle: Interested in ${sellerInfo.item}`
    const body = `Hi ${sellerInfo.name},\n\nI'm interested in your ${sellerInfo.item} for ₹${sellerInfo.price}. Could we discuss the details?\n\nThanks!`
    window.open(`mailto:${sellerInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Contact Seller</h1>
          <p className="text-muted-foreground">Discuss the item with the seller</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Seller Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{sellerInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">Verified Seller</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{sellerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Mumbai, Maharashtra</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Item Details</h4>
                  <p className="text-sm">{sellerInfo.item}</p>
                  <p className="text-lg font-semibold text-green-600">₹{sellerInfo.price}</p>
                </div>

                <div className="space-y-2">
                  <Button onClick={openEmail} className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Seller
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with {sellerInfo.name}
                </CardTitle>
                <CardDescription>
                  Discuss the {sellerInfo.item} and arrange pickup
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'buyer'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common things to discuss with the seller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                onClick={() => setNewMessage("Is the item still available?")}
                className="text-left justify-start"
              >
                Check Availability
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNewMessage("Can I see more photos?")}
                className="text-left justify-start"
              >
                Request Photos
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNewMessage("Where can we meet for pickup?")}
                className="text-left justify-start"
              >
                Arrange Pickup
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNewMessage("Is the price negotiable?")}
                className="text-left justify-start"
              >
                Negotiate Price
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}