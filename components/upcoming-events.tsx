"use client"

import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const events = [
  {
    id: 1,
    title: "Community Cleanup Day",
    date: "Sep 15, 2023",
    time: "9:00 AM - 12:00 PM",
    location: "Cubbon Park, Bengaluru",
    attendees: 24,
    type: "cleanup",
  },
  {
    id: 2,
    title: "Recycling Workshop",
    date: "Sep 18, 2023",
    time: "6:30 PM - 8:00 PM",
    location: "Jayanagar Community Hall, Bengaluru",
    attendees: 18,
    type: "workshop",
  },
  {
    id: 3,
    title: "Sustainable Living Fair",
    date: "Sep 23, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "Lalbagh Glass House, Bengaluru",
    attendees: 120,
    type: "fair",
  },
]

export function UpcomingEvents() {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{event.title}</h3>
            <Badge
              variant="outline"
              className={`
                ${event.type === "cleanup" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                ${event.type === "workshop" ? "border-purple-200 bg-purple-50 text-purple-700" : ""}
                ${event.type === "fair" ? "border-amber-200 bg-amber-50 text-amber-700" : ""}
              `}
            >
              {event.type}
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              {event.date}, {event.time}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="mr-2 h-4 w-4" />
              {event.attendees} attending
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-green-700 border-green-200 hover:bg-green-50 bg-transparent"
            >
              RSVP
            </Button>
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <Button variant="link" className="text-green-700">
          View all events
        </Button>
      </div>
    </div>
  )
}
