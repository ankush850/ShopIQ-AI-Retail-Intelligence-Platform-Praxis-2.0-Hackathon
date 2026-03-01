import type { ProcessedData, ForecastData, ModelMetrics, KPIData } from "./types"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const CATEGORIES = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"]
const MONTHS = [
  "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024",
  "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024",
]
const SEASONS: Record<string, string> = {
  "Jan 2024": "Winter", "Feb 2024": "Winter", "Mar 2024": "Spring",
  "Apr 2024": "Spring", "May 2024": "Spring", "Jun 2024": "Summer",
  "Jul 2024": "Summer", "Aug 2024": "Summer", "Sep 2024": "Fall",
  "Oct 2024": "Fall", "Nov 2024": "Fall", "Dec 2024": "Winter",
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generatePrebuiltData(): {
  data: ProcessedData
  forecast: ForecastData
  metrics: ModelMetrics
  kpis: KPIData
} {
  const revenueBase = [
    42000, 38000, 45000, 51000, 48000, 55000,
    62000, 58000, 53000, 67000, 72000, 85000,
  ]

  const monthlyRevenue = MONTHS.map((month, i) => ({
    month,
    revenue: revenueBase[i] + Math.round(seededRandom(i * 7) * 5000 - 2500),
  }))

  const categoryValues = [185000, 142000, 98000, 76000, 54000]
  const categoryDistribution = CATEGORIES.map((name, i) => ({
    name,
    value: categoryValues[i] + Math.round(seededRandom(i * 13) * 10000),
    fill: CHART_COLORS[i],
  }))

  const seasonalTrend = MONTHS.map((month, i) => ({
    month,
    revenue: revenueBase[i] + Math.round(seededRandom(i * 11) * 3000),
    season: SEASONS[month],
  }))

  const rollingAverages = MONTHS.map((month, i) => {
    const windowStart = Math.max(0, i - 2)
    const window = revenueBase.slice(windowStart, i + 1)
    const average = Math.round(window.reduce((a, b) => a + b, 0) / window.length)
    return { month, average }
  })

  const totalRev = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue
  const growthRate = ((lastMonth - prevMonth) / prevMonth) * 100

  const raw = Array.from({ length: 1200 }, (_, i) => ({
    id: i + 1,
    Category: CATEGORIES[Math.floor(seededRandom(i * 3) * CATEGORIES.length)],
    "Purchase Amount": Math.round(seededRandom(i * 5) * 500 + 10),
    Date: `2024-${String(Math.floor(seededRandom(i * 7) * 12) + 1).padStart(2, "0")}-${String(Math.floor(seededRandom(i * 11) * 28) + 1).padStart(2, "0")}`,
    Customer: `Customer_${Math.floor(seededRandom(i * 13) * 500) + 1}`,
    Region: ["North", "South", "East", "West"][Math.floor(seededRandom(i * 17) * 4)],
  }))

  const data: ProcessedData = {
    raw,
    cleaned: raw,
    columnMapping: {
      category: "Category",
      purchaseAmount: "Purchase Amount",
      date: "Date",
      customerId: "Customer",
    },
    features: {
      monthlyRevenue,
      categoryDistribution,
      purchaseFrequency: CATEGORIES.map((category, i) => ({
        category,
        frequency: Math.round(seededRandom(i * 19) * 300 + 100),
      })),
      growthRate,
      rollingAverages,
      trendSlope: 2847,
      seasonalTrend,
    },
    summary: {
      totalRows: 1200,
      cleanedRows: 1200,
      removedDuplicates: 0,
      removedNulls: 0,
      outliers: 0,
      columns: ["id", "Category", "Purchase Amount", "Date", "Customer", "Region"],
      dateRange: { start: "2024-01-01", end: "2024-12-31" },
    },
  }

  const forecastMonths = ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025"]
  const forecast: ForecastData = {
    historical: monthlyRevenue,
    predicted: forecastMonths.map((month, i) => {
      const base = lastMonth + (i + 1) * 2800
      return {
        month,
        revenue: base + Math.round(seededRandom(i * 23) * 3000),
        lower: base - 8000,
        upper: base + 12000,
      }
    }),
  }

  const metrics: ModelMetrics = {
    rmse: 3241.5,
    mae: 2567.3,
    r2: 0.87,
    version: "v1.0.0",
    trainedAt: "2024-12-15T10:30:00Z",
    datasetSize: 1200,
  }

  const kpis: KPIData = {
    totalRevenue: totalRev,
    monthlyGrowth: Math.round(growthRate * 100) / 100,
    topCategory: "Electronics",
    forecastNextQuarter: forecast.predicted.slice(0, 3).reduce((s, p) => s + p.revenue, 0),
    sparklines: {
      revenue: monthlyRevenue.map((m) => m.revenue),
      growth: [2.1, 3.5, -1.2, 4.8, 2.3, 5.1, 3.7, -0.8, 6.2, 4.1, 7.3, 8.9],
      category: categoryValues,
      forecast: forecast.predicted.map((p) => p.revenue),
    },
  }

  return { data, forecast, metrics, kpis }
}
