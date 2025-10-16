"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ImpactChartProps {
  timeframe: "week" | "month" | "year"
  isNewUser?: boolean
}

export function ImpactChart({ timeframe, isNewUser = false }: ImpactChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (isNewUser) {
      // Show empty data for new users
      if (timeframe === "week") {
        setData([
          { name: "Mon", recycled: 0, co2: 0 },
          { name: "Tue", recycled: 0, co2: 0 },
          { name: "Wed", recycled: 0, co2: 0 },
          { name: "Thu", recycled: 0, co2: 0 },
          { name: "Fri", recycled: 0, co2: 0 },
          { name: "Sat", recycled: 0, co2: 0 },
          { name: "Sun", recycled: 0, co2: 0 },
        ])
      } else if (timeframe === "month") {
        setData([
          { name: "Week 1", recycled: 0, co2: 0 },
          { name: "Week 2", recycled: 0, co2: 0 },
          { name: "Week 3", recycled: 0, co2: 0 },
          { name: "Week 4", recycled: 0, co2: 0 },
        ])
      } else {
        setData([
          { name: "Jan", recycled: 0, co2: 0 },
          { name: "Feb", recycled: 0, co2: 0 },
          { name: "Mar", recycled: 0, co2: 0 },
          { name: "Apr", recycled: 0, co2: 0 },
          { name: "May", recycled: 0, co2: 0 },
          { name: "Jun", recycled: 0, co2: 0 },
          { name: "Jul", recycled: 0, co2: 0 },
          { name: "Aug", recycled: 0, co2: 0 },
          { name: "Sep", recycled: 0, co2: 0 },
          { name: "Oct", recycled: 0, co2: 0 },
          { name: "Nov", recycled: 0, co2: 0 },
          { name: "Dec", recycled: 0, co2: 0 },
        ])
      }
      return
    }

    // Existing data for returning users
    if (timeframe === "week") {
      setData([
        { name: "Mon", recycled: 2.1, co2: 0.7 },
        { name: "Tue", recycled: 3.4, co2: 1.1 },
        { name: "Wed", recycled: 1.8, co2: 0.6 },
        { name: "Thu", recycled: 4.2, co2: 1.4 },
        { name: "Fri", recycled: 3.8, co2: 1.3 },
        { name: "Sat", recycled: 5.1, co2: 1.7 },
        { name: "Sun", recycled: 2.5, co2: 0.8 },
      ])
    } else if (timeframe === "month") {
      setData([
        { name: "Week 1", recycled: 18.2, co2: 6.1 },
        { name: "Week 2", recycled: 22.5, co2: 7.5 },
        { name: "Week 3", recycled: 30.8, co2: 10.3 },
        { name: "Week 4", recycled: 27.4, co2: 9.1 },
      ])
    } else {
      setData([
        { name: "Jan", recycled: 65.3, co2: 21.8 },
        { name: "Feb", recycled: 72.1, co2: 24.0 },
        { name: "Mar", recycled: 84.5, co2: 28.2 },
        { name: "Apr", recycled: 91.2, co2: 30.4 },
        { name: "May", recycled: 102.7, co2: 34.2 },
        { name: "Jun", recycled: 110.5, co2: 36.8 },
        { name: "Jul", recycled: 118.3, co2: 39.4 },
        { name: "Aug", recycled: 127.4, co2: 42.5 },
        { name: "Sep", recycled: 0, co2: 0 },
        { name: "Oct", recycled: 0, co2: 0 },
        { name: "Nov", recycled: 0, co2: 0 },
        { name: "Dec", recycled: 0, co2: 0 },
      ])
    }
  }, [timeframe, isNewUser])

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="recycled"
            name="Recycled (kg)"
            stroke="#166534"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line type="monotone" dataKey="co2" name="CO₂ Saved (kg)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
