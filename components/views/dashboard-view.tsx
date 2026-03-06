"use client"

import { useAppStore } from "@/lib/store"
import { KPICards } from "@/components/kpi-cards"
import { RevenueChart } from "@/components/charts-revenue"
import { CategoryPieChart } from "@/components/charts-category"
import { SeasonalChart } from "@/components/charts-seasonal"
import { ModelMetricsCard } from "@/components/model-metrics-card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardView() {
  const { activeData, forecast, modelMetrics, kpis } = useAppStore()

  if (!activeData || !kpis) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <KPICards data={kpis} />

      {/* Row 2: Primary Revenue Trend + Forecast */}
      <RevenueChart
        data={activeData.features.monthlyRevenue}
        forecast={forecast?.predicted}
      />

      {/* Row 3: Category Pie + Seasonal Trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryPieChart data={activeData.features.categoryDistribution} />
        <SeasonalChart data={activeData.features.seasonalTrend} />
      </div>

      {/* Row 4: Model Metrics */}
      {modelMetrics && <ModelMetricsCard metrics={modelMetrics} />}
    </div>
  )
}
