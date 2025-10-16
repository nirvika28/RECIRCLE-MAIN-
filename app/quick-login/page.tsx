"use client"

import { useState } from "react"
import { authService } from "@/lib/auth-service"
import { createNewUser, saveUser } from "@/lib/user-storage"

export default function QuickLoginPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [displayName, setDisplayName] = useState("Test User")
  const [city, setCity] = useState("Mumbai")
  const [state, setState] = useState("Maharashtra")

  const handleLogin = async () => {
    try {
      console.log('Attempting login...')
      const result = await authService.login(email, password)
      console.log('Login successful:', result)
      alert('Login successful!')
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed: ' + error.message)
    }
  }

  const handleSignup = async () => {
    try {
      console.log('Attempting signup...')
      const result = await authService.signup({
        displayName,
        email,
        password,
        city,
        state
      })
      console.log('Signup successful:', result)
      alert('Signup successful!')
    } catch (error) {
      console.error('Signup failed:', error)
      alert('Signup failed: ' + error.message)
    }
  }

  const createLocalUser = () => {
    try {
      const user = createNewUser({
        displayName,
        email,
        city,
        state
      })
      console.log('Local user created:', user)
      alert('Local user created!')
    } catch (error) {
      console.error('Create user failed:', error)
      alert('Create user failed: ' + error.message)
    }
  }

  const checkAuth = () => {
    const token = authService.getToken()
    const user = authService.getUser()
    const localUser = createNewUser({
      displayName: "Test User",
      email: "test@example.com", 
      city: "Mumbai",
      state: "Maharashtra"
    })
    
    console.log('Auth status:', { token: !!token, user: !!user, localUser: !!localUser })
    alert(`Auth Status:\nToken: ${token ? 'Present' : 'Missing'}\nUser: ${user ? 'Present' : 'Missing'}\nLocal User: ${localUser ? 'Present' : 'Missing'}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick Authentication Setup</h1>
      
      <div className="grid gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input 
            type="text" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input 
              type="text" 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        
        <button 
          onClick={handleSignup}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Signup
        </button>
        
        <button 
          onClick={createLocalUser}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Create Local User
        </button>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={checkAuth}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Check Auth Status
        </button>
      </div>
    </div>
  )
}
