"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts"
import { TrendingUp, AlertTriangle, Info } from "lucide-react"

export function ForecastView() {
  const { forecast, modelMetrics, activeData } = useAppStore()

  if (!forecast || !modelMetrics) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="rounded-xl bg-muted p-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No forecast data available. Load or upload a dataset first.
        </p>
      </div>
    )
  }

  // Combine historical + predicted for the main chart
  const combined = [
    ...forecast.historical.map((h) => ({
      month: h.month,
      revenue: h.revenue,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    })),
    // Bridge point
    {
      month: forecast.historical[forecast.historical.length - 1]?.month || "",
      revenue: forecast.historical[forecast.historical.length - 1]?.revenue || 0,
      predicted: forecast.historical[forecast.historical.length - 1]?.revenue || 0,
      lower: forecast.historical[forecast.historical.length - 1]?.revenue || 0,
      upper: forecast.historical[forecast.historical.length - 1]?.revenue || 0,
    },
    ...forecast.predicted.map((p) => ({
      month: p.month,
      revenue: null as number | null,
      predicted: p.revenue,
      lower: p.lower,
      upper: p.upper,
    })),
  ]

  // Anomaly detection: find months where revenue deviates > 2 std from rolling avg
  const values = forecast.historical.map((h) => h.revenue)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)
  const anomalies = forecast.historical.filter(
    (h) => Math.abs(h.revenue - mean) > 1.5 * std
  )

  // Confidence summary
  const avgConfidence =
    forecast.predicted.reduce((sum, p) => {
      const range = p.upper - p.lower
      return sum + (1 - range / (p.revenue * 2)) * 100
    }, 0) / forecast.predicted.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Revenue Forecast
          </h2>
          <p className="text-sm text-muted-foreground">
            6-month projection with confidence intervals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-border text-foreground">
            R{"\u00B2"}: {modelMetrics.r2.toFixed(3)}
          </Badge>
          <Badge variant="outline" className="border-accent/30 text-accent text-xs">
            {modelMetrics.version}
          </Badge>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Historical & Projected Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06ffa5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06ffa5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06ffa5" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
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
                  formatter={(value: any, name: string) => {
                    if (value == null) return ["-", name]
                    return [`$${(typeof value === 'number' ? value : 0).toLocaleString()}`, name]
                  }}
                />
                {/* Confidence band */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="var(--card)"
                  dot={false}
                />
                {/* Historical */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#histGrad)"
                  dot={false}
                  connectNulls={false}
                />
                {/* Predicted */}
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  fill="url(#predGrad)"
                  dot={false}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-chart-1" />
              <span className="text-xs text-muted-foreground">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 border-t-2 border-dashed border-chart-2" />
              <span className="text-xs text-muted-foreground">Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-6 rounded bg-chart-2/10" />
              <span className="text-xs text-muted-foreground">
                Confidence Band
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row: Forecast Table + Anomalies */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Forecast Table */}
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Forecast Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      Month
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Predicted
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Lower
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      Upper
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.predicted.map((p) => (
                    <tr key={p.month} className="border-t border-border">
                      <td className="px-3 py-2 text-card-foreground">{p.month}</td>
                      <td className="px-3 py-2 text-right font-mono text-card-foreground">
                        ${p.revenue.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        ${p.lower.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        ${p.upper.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 p-3">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Average confidence: {avgConfidence.toFixed(1)}%. Forecast uses
                linear regression trained on {modelMetrics.datasetSize.toLocaleString()} samples.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            {anomalies.length > 0 ? (
              <>
                <div className="space-y-2">
                  {anomalies.map((a) => (
                    <div
                      key={a.month}
                      className="flex items-center justify-between rounded-lg bg-chart-3/10 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-chart-3" />
                        <span className="text-sm text-card-foreground">{a.month}</span>
                      </div>
                      <span className="text-sm font-mono text-chart-3">
                        ${a.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {anomalies.length} month(s) deviated more than 1.5 standard deviations from the mean revenue of ${mean.toLocaleString()}.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="rounded-full bg-accent/10 p-3">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No significant anomalies detected in the dataset.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
