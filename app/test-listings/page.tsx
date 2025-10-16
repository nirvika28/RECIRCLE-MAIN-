"use client"

export default function TestListingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Listings Page</h1>
      <p className="text-green-600 mb-4">✅ This page works without any API calls!</p>
      
      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold">Vintage Wooden Chair</h3>
          <p className="text-gray-600">Beautiful vintage wooden chair in excellent condition</p>
          <p className="text-green-600 font-semibold">₹150</p>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold">Test Item</h3>
          <p className="text-gray-600">This is the item you just submitted</p>
          <p className="text-green-600 font-semibold">₹100</p>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
        </div>
      </div>
      
      <div className="mt-6">
        <a href="/dashboard/marketplace/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Create New Listing
        </a>
      </div>
    </div>
  )
}
