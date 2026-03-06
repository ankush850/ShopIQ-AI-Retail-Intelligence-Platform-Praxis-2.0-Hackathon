"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import type { ProcessedData } from "@/lib/types"

interface RevenueChartProps {
  data: ProcessedData["features"]["monthlyRevenue"]
  forecast?: { month: string; revenue: number; lower?: number; upper?: number }[]
}

export function RevenueChart({ data, forecast }: RevenueChartProps) {
  const combined = [
    ...data.map((d) => ({ ...d, type: "historical" as const })),
    ...(forecast?.map((f) => ({
      month: f.month,
      revenue: f.revenue,
      lower: f.lower,
      upper: f.upper,
      type: "forecast" as const,
    })) || []),
  ]

  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Revenue Trend & Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combined}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                  color: "var(--card-foreground)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#revGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
              />
              {forecast && forecast.length > 0 && (
                <>
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="url(#forecastGradient)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="var(--card)"
                    dot={false}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
