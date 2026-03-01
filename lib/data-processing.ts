import Papa from "papaparse"
import type {
  DataRow,
  ValidationResult,
  ColumnMapping,
  ProcessedData,
  ForecastData,
  ModelMetrics,
  KPIData,
} from "./types"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Step 1: Parse CSV
export function parseCSV(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as DataRow[])
      },
      error: (error: Error) => {
        reject(error)
      },
    })
  })
}

// Step 2: Validation
export function validateData(
  rows: DataRow[],
  file: File
): ValidationResult {
  const errors: ValidationResult["errors"] = []
  const warnings: string[] = []

  if (!file.name.endsWith(".csv")) {
    errors.push({ type: "wrong_format", message: "File must be a CSV file." })
    return { isValid: false, errors, warnings, columnMapping: null }
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push({ type: "file_too_large", message: "File exceeds 10MB limit." })
    return { isValid: false, errors, warnings, columnMapping: null }
  }

  if (rows.length === 0) {
    errors.push({ type: "invalid_data", message: "File contains no data rows." })
    return { isValid: false, errors, warnings, columnMapping: null }
  }

  const columns = Object.keys(rows[0])
  const lowerColumns = columns.map((c) => c.toLowerCase().trim())

  // Smart column mapping
  const mapping: ColumnMapping = {
    category: "",
    purchaseAmount: "",
    date: "",
  }

  const categoryAliases = ["category", "product_category", "item_category", "type", "product_type"]
  const amountAliases = ["purchase amount", "purchase_amount", "amount", "price", "total", "revenue", "sales", "purchase amount (usd)"]
  const dateAliases = ["date", "purchase_date", "order_date", "transaction_date", "created_at"]
  const customerAliases = ["customer", "customer_id", "customer id", "client_id", "client id", "cust_id"]

  for (let i = 0; i < lowerColumns.length; i++) {
    const col = lowerColumns[i]
    if (!mapping.category && categoryAliases.includes(col)) mapping.category = columns[i]
    if (!mapping.purchaseAmount && amountAliases.includes(col)) mapping.purchaseAmount = columns[i]
    if (!mapping.date && dateAliases.includes(col)) mapping.date = columns[i]
    if (!mapping.customerId && customerAliases.includes(col)) mapping.customerId = columns[i]
  }

  if (!mapping.category) {
    errors.push({ type: "missing_column", message: "Missing 'Category' column.", details: `Available columns: ${columns.join(", ")}` })
  }
  if (!mapping.purchaseAmount) {
    errors.push({ type: "missing_column", message: "Missing 'Purchase Amount' column.", details: `Available columns: ${columns.join(", ")}` })
  }
  if (!mapping.date) {
    errors.push({ type: "missing_column", message: "Missing 'Date' column.", details: `Available columns: ${columns.join(", ")}` })
  }

  if (errors.length === 0) {
    const nullCount = rows.filter(
      (r) => !r[mapping.category] || !r[mapping.purchaseAmount] || !r[mapping.date]
    ).length
    if (nullCount > 0) {
      warnings.push(`${nullCount} rows have null values and will be cleaned.`)
    }

    const amounts = rows
      .map((r) => Number(r[mapping.purchaseAmount]))
      .filter((n) => !isNaN(n))
    if (amounts.length < rows.length * 0.5) {
      errors.push({ type: "invalid_data", message: "More than 50% of amount values are non-numeric." })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    columnMapping: errors.length === 0 ? mapping : null,
  }
}

// Step 3: Data Cleaning
export function cleanData(rows: DataRow[], mapping: ColumnMapping): { cleaned: DataRow[]; stats: { removedNulls: number; removedDuplicates: number; outliers: number } } {
  // Remove null values
  let cleaned = rows.filter(
    (r) => r[mapping.category] && r[mapping.purchaseAmount] != null && r[mapping.date]
  )
  const removedNulls = rows.length - cleaned.length

  // Normalize categories
  cleaned = cleaned.map((r) => ({
    ...r,
    [mapping.category]: String(r[mapping.category]).trim(),
  }))

  // Remove duplicates (by stringifying)
  const seen = new Set<string>()
  const deduped = cleaned.filter((r) => {
    const key = JSON.stringify(r)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const removedDuplicates = cleaned.length - deduped.length
  cleaned = deduped

  // Handle outliers (IQR method on amounts)
  const amounts = cleaned.map((r) => Number(r[mapping.purchaseAmount])).filter((n) => !isNaN(n)).sort((a, b) => a - b)
  const q1 = amounts[Math.floor(amounts.length * 0.25)]
  const q3 = amounts[Math.floor(amounts.length * 0.75)]
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr

  const beforeOutlier = cleaned.length
  cleaned = cleaned.filter((r) => {
    const v = Number(r[mapping.purchaseAmount])
    return v >= lower && v <= upper
  })
  const outliers = beforeOutlier - cleaned.length

  return { cleaned, stats: { removedNulls, removedDuplicates, outliers } }
}

// Step 4: Feature Engineering
export function engineerFeatures(
  cleaned: DataRow[],
  mapping: ColumnMapping
): ProcessedData["features"] {
  // Parse dates and group by month
  const monthMap = new Map<string, number>()
  const categoryMap = new Map<string, number>()

  cleaned.forEach((r) => {
    const dateStr = String(r[mapping.date])
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return

    const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    const amount = Number(r[mapping.purchaseAmount]) || 0
    const category = String(r[mapping.category])

    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amount)
    categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
  })

  const monthlyRevenue = Array.from(monthMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))

  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const categoryDistribution = categories.map(([name, value], i) => ({
    name,
    value: Math.round(value),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Purchase frequency per category
  const freqMap = new Map<string, number>()
  cleaned.forEach((r) => {
    const cat = String(r[mapping.category])
    freqMap.set(cat, (freqMap.get(cat) || 0) + 1)
  })
  const purchaseFrequency = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, frequency]) => ({ category, frequency }))

  // Growth rate
  const revValues = monthlyRevenue.map((m) => m.revenue)
  const growthRate = revValues.length >= 2
    ? ((revValues[revValues.length - 1] - revValues[revValues.length - 2]) / revValues[revValues.length - 2]) * 100
    : 0

  // Rolling averages (3-month window)
  const rollingAverages = monthlyRevenue.map((m, i) => {
    const start = Math.max(0, i - 2)
    const window = revValues.slice(start, i + 1)
    return { month: m.month, average: Math.round(window.reduce((a, b) => a + b, 0) / window.length) }
  })

  // Trend slope (simple linear regression)
  const n = revValues.length
  const xMean = (n - 1) / 2
  const yMean = revValues.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (revValues[i] - yMean)
    den += (i - xMean) * (i - xMean)
  }
  const trendSlope = den !== 0 ? Math.round(num / den) : 0

  // Seasonal trend
  const seasonMap: Record<string, string> = {}
  monthlyRevenue.forEach((m) => {
    const d = new Date(m.month)
    const mo = d.getMonth()
    if (mo <= 1 || mo === 11) seasonMap[m.month] = "Winter"
    else if (mo <= 4) seasonMap[m.month] = "Spring"
    else if (mo <= 7) seasonMap[m.month] = "Summer"
    else seasonMap[m.month] = "Fall"
  })

  const seasonalTrend = monthlyRevenue.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    season: seasonMap[m.month] || "Unknown",
  }))

  return {
    monthlyRevenue,
    categoryDistribution,
    purchaseFrequency,
    growthRate: Math.round(growthRate * 100) / 100,
    rollingAverages,
    trendSlope,
    seasonalTrend,
  }
}

// Step 5: Model Training (simulated regression with evaluation)
export function trainModel(
  features: ProcessedData["features"],
  dataSize: number
): { forecast: ForecastData; metrics: ModelMetrics } {
  const historical = features.monthlyRevenue
  const revValues = historical.map((m) => m.revenue)
  const n = revValues.length

  // Simple linear regression for forecast
  const xMean = (n - 1) / 2
  const yMean = revValues.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (revValues[i] - yMean)
    den += (i - xMean) * (i - xMean)
  }
  const slope = den !== 0 ? num / den : 0
  const intercept = yMean - slope * xMean

  // Generate predictions for next 6 months
  const lastDate = new Date(historical[historical.length - 1]?.month || "2024-12-01")
  const predicted = Array.from({ length: 6 }, (_, i) => {
    const futureDate = new Date(lastDate)
    futureDate.setMonth(futureDate.getMonth() + i + 1)
    const month = futureDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    const x = n + i
    const base = Math.round(slope * x + intercept)
    const noise = Math.round(Math.sin((i + 1) * 2.5) * 2000)
    const revenue = Math.max(0, base + noise)
    const stdDev = Math.round(Math.abs(slope) * 2 + yMean * 0.08)
    return {
      month,
      revenue,
      lower: Math.max(0, revenue - stdDev),
      upper: revenue + stdDev,
    }
  })

  // Evaluate model on training data
  const predictions = revValues.map((_, i) => Math.round(slope * i + intercept))
  const errors = revValues.map((actual, i) => actual - predictions[i])
  const mse = errors.reduce((sum, e) => sum + e * e, 0) / n
  const rmse = Math.sqrt(mse)
  const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / n
  const ssRes = errors.reduce((sum, e) => sum + e * e, 0)
  const ssTot = revValues.reduce((sum, v) => sum + (v - yMean) * (v - yMean), 0)
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0

  const metrics: ModelMetrics = {
    rmse: Math.round(rmse * 10) / 10,
    mae: Math.round(mae * 10) / 10,
    r2: Math.round(r2 * 1000) / 1000,
    version: `v${Date.now().toString(36).slice(-4)}`,
    trainedAt: new Date().toISOString(),
    datasetSize: dataSize,
  }

  return { forecast: { historical, predicted }, metrics }
}

// Step 6: Generate KPIs
export function generateKPIs(
  features: ProcessedData["features"],
  forecast: ForecastData
): KPIData {
  const revValues = features.monthlyRevenue.map((m) => m.revenue)
  const totalRevenue = revValues.reduce((sum, v) => sum + v, 0)
  const lastMonth = revValues[revValues.length - 1] || 0
  const prevMonth = revValues[revValues.length - 2] || 1
  const monthlyGrowth = Math.round(((lastMonth - prevMonth) / prevMonth) * 10000) / 100

  const topCategory = features.categoryDistribution.length > 0
    ? features.categoryDistribution[0].name
    : "N/A"

  const forecastNextQuarter = forecast.predicted
    .slice(0, 3)
    .reduce((sum, p) => sum + p.revenue, 0)

  return {
    totalRevenue,
    monthlyGrowth,
    topCategory,
    forecastNextQuarter,
    sparklines: {
      revenue: revValues.slice(-8),
      growth: revValues.slice(-8).map((v, i, arr) =>
        i === 0 ? 0 : Math.round(((v - arr[i - 1]) / arr[i - 1]) * 100)
      ),
      category: features.categoryDistribution.map((c) => c.value),
      forecast: forecast.predicted.map((p) => p.revenue),
    },
  }
}
