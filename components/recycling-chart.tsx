"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

type Slice = { name: string; value: number }

const DEFAULT_DATA: Slice[] = [
  { name: "Paper", value: 42 },
  { name: "Plastic", value: 28 },
  { name: "Glass", value: 15 },
  { name: "Metal", value: 10 },
  { name: "Organic", value: 5 },
]

const EMPTY_DATA: Slice[] = [
  { name: "Paper", value: 0 },
  { name: "Plastic", value: 0 },
  { name: "Glass", value: 0 },
  { name: "Metal", value: 0 },
  { name: "Organic", value: 0 },
]

const COLORS = ["#166534", "#22c55e", "#86efac", "#bbf7d0", "#dcfce7"]

export function RecyclingChart({ data, isNewUser = false }: { data?: Slice[]; isNewUser?: boolean }) {
  const chartData = isNewUser ? EMPTY_DATA : (data || DEFAULT_DATA)
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} kg`, "Amount"]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
