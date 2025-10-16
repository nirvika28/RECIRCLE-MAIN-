"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Loader2 className="h-6 w-6 text-green-700 animate-spin" />
          </div>
          <h1 className="text-2xl font-light text-green-800">One step closer to entering ReCircle</h1>
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
