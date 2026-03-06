"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ProcessedData } from "@/lib/types"

interface SeasonalChartProps {
  data: ProcessedData["features"]["seasonalTrend"]
}

const SEASON_COLORS: Record<string, string> = {
  Winter: "var(--chart-1)",
  Spring: "var(--chart-2)",
  Summer: "var(--chart-3)",
  Fall: "var(--chart-4)",
}

export function SeasonalChart({ data }: SeasonalChartProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Seasonal Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                formatter={(value: number, _name: string, props: { payload?: { season?: string } }) => [
                  `$${value.toLocaleString()}`,
                  props.payload?.season || "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={(props: { cx: number; cy: number; payload: { season: string }; index: number }) => {
                  const color = SEASON_COLORS[props.payload.season] || "var(--chart-2)"
                  return (
                    <circle
                      key={props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill={color}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  )
                }}
                activeDot={{ r: 7, fill: "var(--card)", stroke: "var(--chart-2)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          {Object.entries(SEASON_COLORS).map(([season, color]) => (
            <div key={season} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{season}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
