"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { GitCompareArrows, Info } from "lucide-react"

export function ComparisonView() {
  const { prebuiltData, userData, mode } = useAppStore()

  const baseline = prebuiltData
  const user = userData

  if (!baseline) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="rounded-xl bg-muted p-4">
          <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No baseline data available.
        </p>
      </div>
    )
  }

  const hasUserData = !!user

  // Combine monthly revenue for comparison
  const allMonths = new Set([
    ...baseline.features.monthlyRevenue.map((m) => m.month),
    ...(user?.features.monthlyRevenue.map((m) => m.month) || []),
  ])

  const comparisonData = Array.from(allMonths)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((month) => ({
      month,
      baseline:
        baseline.features.monthlyRevenue.find((m) => m.month === month)
          ?.revenue || null,
      user: user?.features.monthlyRevenue.find((m) => m.month === month)
        ?.revenue || null,
    }))

  // Category comparison
  const baseCategories = baseline.features.categoryDistribution
  const userCategories = user?.features.categoryDistribution || []

  // Summary stats
  const baselineTotal = baseline.features.monthlyRevenue.reduce(
    (s, m) => s + m.revenue,
    0
  )
  const userTotal = user?.features.monthlyRevenue.reduce(
    (s, m) => s + m.revenue,
    0
  ) || 0

  const diff = hasUserData ? ((userTotal - baselineTotal) / baselineTotal) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Dataset Comparison
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasUserData
              ? "Baseline vs. User Dataset Analysis"
              : "Upload a dataset in Analysis mode to compare against the baseline"}
          </p>
        </div>
      </div>

      {!hasUserData && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-4">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Currently showing baseline data only. Switch to Analysis mode and
            upload a CSV to see a side-by-side comparison.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Baseline Revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-card-foreground font-mono">
              ${baselineTotal.toLocaleString()}
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {baseline.summary.cleanedRows.toLocaleString()} rows
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              User Revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-card-foreground font-mono">
              {hasUserData ? `$${userTotal.toLocaleString()}` : "--"}
            </p>
            {hasUserData && user && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {user.summary.cleanedRows.toLocaleString()} rows
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Difference
            </p>
            <p
              className={`mt-1 text-2xl font-bold font-mono ${
                diff > 0 ? "text-accent" : diff < 0 ? "text-destructive" : "text-card-foreground"
              }`}
            >
              {hasUserData ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%` : "--"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Comparison Line Chart */}
      <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Revenue Trend Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
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
                  }}
                  formatter={(value: number | null, name: string) => {
                    if (value == null) return ["-", name]
                    return [`$${value.toLocaleString()}`, name === "baseline" ? "Baseline" : "User"]
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                {hasUserData && (
                  <Line
                    type="monotone"
                    dataKey="user"
                    name="User Dataset"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Baseline Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={baseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {baseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: 12,
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br  shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {hasUserData ? "User Categories" : "No User Data"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {hasUserData && userCategories.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {userCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: 12,
                        color: "var(--card-foreground)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Upload a dataset to see category comparison
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


