"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 sticky top-0 z-50 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-full w-full text-white p-1"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M7 10.5A1.5 1.5 0 0 1 8.5 9a1.5 1.5 0 0 1 1.5 1.5v7.9a1.5 1.5 0 0 1-3 0v-7.9Z" />
              <path d="M14 7.5a1.5 1.5 0 0 1 3 0v11.9a1.5 1.5 0 0 1-3 0V7.5Z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-green-800">ReCircle</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="#features" className="text-gray-600 hover:text-green-700 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-green-700 transition-colors">
            How It Works
          </Link>
          <Link href="#community" className="text-gray-600 hover:text-green-700 transition-colors">
            Community
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-green-700 hover:bg-green-50">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700">Join Now</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden p-4 bg-white border-t border-gray-100">
          <nav className="flex flex-col space-y-4 text-sm font-medium">
            <Link
              href="#features"
              className="text-gray-600 hover:text-green-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-green-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#community"
              className="text-gray-600 hover:text-green-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-center">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full justify-center bg-green-600 hover:bg-green-700">Join Now</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
