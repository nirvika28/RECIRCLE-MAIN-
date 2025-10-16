"use client"

import { useEffect, useState } from "react"
import { authService } from "@/lib/auth-service"
import { loadUser } from "@/lib/user-storage"

export default function DebugAuthPage() {
  const [authData, setAuthData] = useState<any>(null)

  useEffect(() => {
    const token = authService.getToken()
    const user = authService.getUser()
    const localUser = loadUser()
    
    setAuthData({
      token: token ? `${token.substring(0, 20)}...` : null,
      tokenLength: token?.length || 0,
      user: user,
      localUser: localUser,
      isAuthenticated: authService.isAuthenticated()
    })
  }, [])

  const testApiCall = async () => {
    try {
      const token = authService.getToken()
      console.log('Testing API call with token:', token ? 'Present' : 'Missing')
      
      const response = await fetch('/api/ecotrade/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      const data = await response.json()
      console.log('API Response:', { status: response.status, data })
      
      alert(`API Response: ${response.status} - ${JSON.stringify(data)}`)
    } catch (error) {
      console.error('API Test Error:', error)
      alert(`API Test Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current Auth State:</h2>
        <pre className="text-sm">{JSON.stringify(authData, null, 2)}</pre>
      </div>
      
      <button 
        onClick={testApiCall}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test API Call
      </button>
    </div>
  )
}
