export interface DataRow {
  [key: string]: string | number | Date | null
}

export interface ProcessedData {
  raw: DataRow[]
  cleaned: DataRow[]
  features: FeatureData
  summary: DataSummary
  columnMapping?: ColumnMapping
}

export interface FeatureData {
  monthlyRevenue: { month: string; revenue: number }[]
  categoryDistribution: { name: string; value: number; fill: string }[]
  purchaseFrequency: { category: string; frequency: number }[]
  growthRate: number
  rollingAverages: { month: string; average: number }[]
  trendSlope: number
  seasonalTrend: { month: string; revenue: number; season: string }[]
}

export interface DataSummary {
  totalRows: number
  cleanedRows: number
  removedDuplicates: number
  removedNulls: number
  outliers: number
  columns: string[]
  dateRange: { start: string; end: string }
}

export interface ForecastData {
  historical: { month: string; revenue: number }[]
  predicted: { month: string; revenue: number; lower: number; upper: number }[]
}

export interface ModelMetrics {
  rmse: number
  mae: number
  r2: number
  version: string
  trainedAt: string
  datasetSize: number
}

export interface KPIData {
  totalRevenue: number
  monthlyGrowth: number
  topCategory: string
  forecastNextQuarter: number
  sparklines: {
    revenue: number[]
    growth: number[]
    category: number[]
    forecast: number[]
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: string[]
  columnMapping: ColumnMapping | null
}

export interface ValidationError {
  type: "missing_column" | "invalid_data" | "file_too_large" | "wrong_format"
  message: string
  details?: string
}

export interface ColumnMapping {
  category: string
  purchaseAmount: string
  date: string
  customerId?: string
  [key: string]: string | undefined
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  chartAction?: string
}

export type AppMode = "prebuilt" | "analysis"
export type AppView = "dashboard" | "forecast" | "comparison" | "upload" | "settings" | "behavior"
export type ProcessingStep = "upload" | "validation" | "cleaning" | "engineering" | "training" | "complete"

// Shopper Behavior & Affinity Discovery
export interface TransactionRow {
  customerId: string
  date: Date
  category: string
  amount: number
}

export interface CustomerFeatures {
  customerId: string
  recency: number
  frequency: number
  monetary: number
  avgBasketSize: number
  categoryDiversity: number
  purchaseConsistency: number
  rfmScore: number
  rfmSegment: string
  clusterId: number
  clusterLabel: string
  behaviorType: string
}

export interface RFMSegmentSummary {
  segment: string
  count: number
  revenue: number
  revenueShare: number
  description: string
}

export interface RFMTrendPoint {
  period: string
  [segment: string]: string | number
}

export interface ClusterSegmentSummary {
  segment: string
  count: number
  avgSpend: number
  revenueShare: number
  description: string
}

export interface AffinityRule {
  antecedent: string[]
  consequent: string[]
  support: number
  confidence: number
  lift: number
  interpretation: string
}

export interface BehavioralInsight {
  type: string
  count: number
  share: number
  description: string
  trend: "growing" | "stable" | "declining" | "emerging"
}

export interface BehaviorResults {
  dataPrep: { totalTransactions: number; uniqueCustomers: number; dateRange: { start: string; end: string } }
  rfm: {
    segmentDistribution: { name: string; value: number; fill: string }[]
    revenueBySegment: { name: string; value: number; fill: string }[]
    segmentTrend: RFMTrendPoint[]
    segmentSummaries: RFMSegmentSummary[]
    interpretation: string
  }
  clustering: {
    segmentDistribution: { name: string; value: number; fill: string }[]
    avgSpendBySegment: { segment: string; avgSpend: number }[]
    revenueShareBySegment: { name: string; value: number; fill: string }[]
    segmentTrend: { period: string; [key: string]: string | number }[]
    segmentSummaries: ClusterSegmentSummary[]
    interpretation: string
  }
  affinity: {
    topRules: AffinityRule[]
    interpretation: string
  }
  behavioral: {
    insights: BehavioralInsight[]
    dominantType: string
    fastestGrowing: string
    decliningSegment: string
    emergingPattern: string
    interpretation: string
  }
}
