"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Users, AlertCircle } from "lucide-react"
import type { BehaviorResults, RFMTrendPoint } from "@/lib/types"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

function RFMSegmentTrendChart({ data }: { data: RFMTrendPoint[] }) {
  const segments = data.length
    ? (Object.keys(data[0]).filter((k) => k !== "period") as string[])
    : []
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: 12,
              color: "var(--card-foreground)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {segments.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ClusterTrendChart({
  data,
}: {
  data: { period: string; [key: string]: string | number }[]
}) {
  const segments = data.length
    ? (Object.keys(data[0]).filter((k) => k !== "period") as string[])
    : []
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: 12,
              color: "var(--card-foreground)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {segments.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BehaviorView() {
  const {
    activeData,
    behaviorResults,
    runBehaviorAnalysisIfNeeded,
  } = useAppStore()

  const hasCustomerColumn = Boolean(
    activeData?.columnMapping?.customerId ||
      (activeData?.raw?.[0] &&
        Object.keys(activeData.raw[0]).some(
          (k) =>
            k.toLowerCase() === "customer" ||
            k.toLowerCase().replace(/\s/g, "_") === "customer_id"
        ))
  )

  useEffect(() => {
    if (activeData && hasCustomerColumn) {
      runBehaviorAnalysisIfNeeded()
    }
  }, [activeData, hasCustomerColumn, runBehaviorAnalysisIfNeeded])

  if (!activeData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!hasCustomerColumn) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-amber-600" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-card-foreground">
              Customer ID column required
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Shopper Behavior & Affinity Discovery needs a Customer ID (or Customer) column in your dataset.
              Upload a CSV with columns: Customer ID, Transaction Date, Product/Category, and Purchase Amount.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!behaviorResults) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  const r = behaviorResults.rfm
  const c = behaviorResults.clustering
  const a = behaviorResults.affinity
  const b = behaviorResults.behavioral
  const prep = behaviorResults.dataPrep

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shopper Behavior Patterns & Affinity Discovery
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customer segments, RFM, clustering, and association rules derived from your transactional data.
        </p>
      </div>

      {/* Data prep summary */}
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Data preparation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {prep.totalTransactions.toLocaleString()} transactions,{" "}
            {prep.uniqueCustomers.toLocaleString()} unique customers. Date range:{" "}
            {prep.dateRange.start} to {prep.dateRange.end}. Nulls and duplicates removed; transaction date converted to datetime; aggregated at customer level with customer-level features.
          </p>
        </CardContent>
      </Card>

      {/* RFM */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-card-foreground">RFM analysis</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                RFM segment distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {r.segmentDistribution.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={r.segmentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {r.segmentDistribution.map((entry, index) => (
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
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No segment data.</p>
              )}
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Revenue contribution per segment
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {r.revenueBySegment.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={r.revenueBySegment}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {r.revenueBySegment.map((entry, index) => (
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
                        formatter={(value: number) => [
                          `$${Number(value).toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No revenue data.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Segment growth trend over time
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <RFMSegmentTrendChart data={r.segmentTrend} />
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              RFM interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{r.interpretation}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              {r.segmentSummaries.filter((s) => s.count > 0).map((s) => (
                <li key={s.segment}>
                  <strong>{s.segment}</strong>: {s.count} customers,{" "}
                  {s.revenueShare.toFixed(1)}% revenue — {s.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Clustering */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-card-foreground">
          Customer segmentation (clustering)
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Segment size distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {c.segmentDistribution.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={c.segmentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {c.segmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cluster data.</p>
              )}
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Revenue share per segment
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {c.revenueShareBySegment.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={c.revenueShareBySegment}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {c.revenueShareBySegment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `$${Number(value).toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No revenue data.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Segment trend over time
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ClusterTrendChart data={c.segmentTrend} />
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Clustering interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{c.interpretation}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              {c.segmentSummaries.filter((s) => s.count > 0).map((s, i) => (
                <li key={`cluster-seg-${i}-${s.segment}`}>
                  <strong>{s.segment}</strong>: {s.count} customers, avg spend $
                  {s.avgSpend.toLocaleString()}, {s.revenueShare.toFixed(1)}%
                  revenue — {s.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Affinity */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-card-foreground">
          Affinity discovery (market basket)
        </h3>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Top association rules (lift &gt; 1)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{a.interpretation}</p>
            {a.topRules.length > 0 ? (
              <ul className="space-y-3">
                {a.topRules.map((rule, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-secondary/50 p-3 text-sm"
                  >
                    <span className="font-medium">
                      {rule.antecedent.join(", ")} → {rule.consequent.join(", ")}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      Support: {(rule.support * 100).toFixed(2)}%, Confidence:{" "}
                      {(rule.confidence * 100).toFixed(1)}%, Lift:{" "}
                      {rule.lift.toFixed(2)}
                    </span>
                    <p className="mt-2 text-muted-foreground">
                      {rule.interpretation}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No rules with lift &gt; 1 at current support threshold.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Behavioral patterns */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-card-foreground">
          Behavioral pattern analysis
        </h3>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Behavior distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {b.insights.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={b.insights.map((x, i) => ({
                        name: x.type,
                        value: x.count,
                        fill: CHART_COLORS[i % CHART_COLORS.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {b.insights.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Behavioral insights (from data)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{b.interpretation}</p>
            <p>
              <strong>Most dominant behavior:</strong> {b.dominantType}.
            </p>
            <p>
              <strong>Fastest growing:</strong> {b.fastestGrowing}.
            </p>
            <p>
              <strong>Declining segment:</strong> {b.decliningSegment}.
            </p>
            <p>
              <strong>Emerging co-purchase pattern:</strong> {b.emergingPattern}.
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              {b.insights.map((i) => (
                <li key={i.type}>
                  {i.type}: {i.count} ({i.share.toFixed(1)}%) — {i.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




