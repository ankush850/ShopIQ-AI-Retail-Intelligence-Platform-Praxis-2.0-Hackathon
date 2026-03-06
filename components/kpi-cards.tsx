"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Tag, CalendarClock } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import type { KPIData } from "@/lib/types"

interface KPICardsProps {
  data: KPIData
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      sparkline: data.sparklines.revenue,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Monthly Growth",
      value: `${data.monthlyGrowth > 0 ? "+" : ""}${data.monthlyGrowth}%`,
      icon: TrendingUp,
      sparkline: data.sparklines.growth,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Top Category",
      value: data.topCategory,
      icon: Tag,
      sparkline: data.sparklines.category,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Forecast Q1",
      value: formatCurrency(data.forecastNextQuarter),
      icon: CalendarClock,
      sparkline: data.sparklines.forecast,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-card-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${card.bgColor.replace('/10', '/15')} border border-border/60`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={card.sparkline.map((v, i) => ({ i, v }))}
                >
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={false}
                    className={card.color}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
