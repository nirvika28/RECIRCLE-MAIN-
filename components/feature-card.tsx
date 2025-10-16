"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  className?: string
}

const FeatureCard = ({ icon, title, subtitle, description, className }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
            // Reveal immediately in case animation didn't run
            ;(entry.target as HTMLElement).style.opacity = "1"
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative p-6 border border-gray-100 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md opacity-0 will-change-[opacity,transform]",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-green-700">{title}</h3>
        <p className="text-lg font-medium text-gray-800 mb-2">{subtitle}</p>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard
