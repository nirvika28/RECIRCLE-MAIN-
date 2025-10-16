"use client"

import { useEffect, useState } from "react"

export default function DebugDbPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)

  const checkDatabase = async () => {
    try {
      console.log('Checking database...')
      
      // Check if we can fetch all items
      const response = await fetch('/api/ecotrade/items')
      const data = await response.json()
      
      console.log('Database check result:', data)
      setDbStatus({
        success: response.ok,
        status: response.status,
        itemsCount: data.items?.length || 0,
        items: data.items || []
      })
    } catch (error) {
      console.error('Database check error:', error)
      setDbStatus({
        success: false,
        error: error.message
      })
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
      
      <button 
        onClick={checkDatabase}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Refresh Database Check
      </button>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Database Status:</h2>
        <pre className="text-sm">{JSON.stringify(dbStatus, null, 2)}</pre>
      </div>
    </div>
  )
}
