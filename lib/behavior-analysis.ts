import type {
  DataRow,
  ColumnMapping,
  BehaviorResults,
  TransactionRow,
  CustomerFeatures,
  RFMSegmentSummary,
  RFMTrendPoint,
  ClusterSegmentSummary,
  AffinityRule,
  BehavioralInsight,
} from "./types"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

const RFM_SEGMENTS: Record<string, string> = {
  Champions: "Recent, frequent, high spend — best customers.",
  "Loyal Customers": "Regular buyers with good recency and spend.",
  "Potential Loyalists": "Recent customers with growth potential.",
  "At Risk": "Previously strong, now slipping in recency.",
  Lost: "Long since last purchase; re-engagement needed.",
}

// ——— 1. Data preparation ———
function prepareTransactions(
  cleaned: DataRow[],
  mapping: ColumnMapping
): TransactionRow[] {
  const custKey = mapping.customerId || "customerId"
  const transactions: TransactionRow[] = []
  for (const r of cleaned) {
    const customerId = r[mapping.customerId!] ?? r.customerId ?? r["Customer"]
    if (customerId == null || customerId === "") continue
    const dateVal = r[mapping.date]
    const date = dateVal instanceof Date ? dateVal : new Date(String(dateVal))
    if (isNaN(date.getTime())) continue
    const category = String(r[mapping.category] ?? r["Category"] ?? "").trim()
    const amount = Number(r[mapping.purchaseAmount] ?? r["Purchase Amount"])
    if (!category || isNaN(amount) || amount <= 0) continue
    transactions.push({
      customerId: String(customerId),
      date,
      category,
      amount,
    })
  }
  return transactions
}

function aggregateByCustomer(transactions: TransactionRow[]) {
  const byCustomer = new Map<
    string,
    { dates: Date[]; total: number; categories: Set<string>; amounts: number[] }
  >()
  for (const t of transactions) {
    let c = byCustomer.get(t.customerId)
    if (!c) {
      c = { dates: [], total: 0, categories: new Set(), amounts: [] }
      byCustomer.set(t.customerId, c)
    }
    c.dates.push(t.date)
    c.total += t.amount
    c.categories.add(t.category)
    c.amounts.push(t.amount)
  }
  return byCustomer
}

// ——— 2. RFM ———
function computeRFM(
  byCustomer: Map<
    string,
    { dates: Date[]; total: number; categories: Set<string>; amounts: number[] }
  >,
  maxDate: Date
): Map<string, { recency: number; frequency: number; monetary: number }> {
  const rfm = new Map<
    string,
    { recency: number; frequency: number; monetary: number }
  >()
  for (const [cid, c] of byCustomer) {
    const lastDate = new Date(Math.max(...c.dates.map((d) => d.getTime())))
    const recency = Math.floor(
      (maxDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    )
    rfm.set(cid, {
      recency,
      frequency: c.dates.length,
      monetary: c.total,
    })
  }
  return rfm
}

function standardize(values: number[]): number[] {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n || 1)
  const std = Math.sqrt(variance) || 1
  return values.map((v) => (v - mean) / std)
}

function scoreToTier(score: number): number {
  if (score <= 0.2) return 1
  if (score <= 0.4) return 2
  if (score <= 0.6) return 3
  if (score <= 0.8) return 4
  return 5
}

function getRFMSegment(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return "Champions"
  if (r >= 3 && f >= 3 && m >= 3) return "Loyal Customers"
  if (r >= 4 && f <= 2) return "Potential Loyalists"
  if (r <= 2 && f >= 3) return "At Risk"
  if (r <= 2 && f <= 2) return "Lost"
  if (r >= 3 && m >= 4) return "Loyal Customers"
  if (r <= 2) return "At Risk"
  return "Potential Loyalists"
}

// ——— 3. K-Means & Silhouette ———
function euclidean(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2
  return Math.sqrt(sum)
}

function kMeans(
  points: number[][],
  k: number,
  maxIters = 100
): { labels: number[]; centroids: number[][] } {
  const n = points.length
  const dim = points[0]?.length ?? 0
  let centroids = Array.from({ length: k }, (_, i) =>
    points[Math.floor((i * n) / k)].slice()
  )
  let labels = new Array(n).fill(0)
  for (let iter = 0; iter < maxIters; iter++) {
    const newLabels = points.map((p) => {
      let best = 0
      let bestD = euclidean(p, centroids[0])
      for (let c = 1; c < k; c++) {
        const d = euclidean(p, centroids[c])
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      return best
    })
    const changed = newLabels.some((l, i) => l !== labels[i])
    labels = newLabels
    if (!changed) break
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0))
    const counts = new Array(k).fill(0)
    points.forEach((p, i) => {
      const c = labels[i]
      counts[c]++
      for (let d = 0; d < dim; d++) sums[c][d] += p[d]
    })
    centroids = sums.map((s, c) =>
      s.map((v) => (counts[c] ? v / counts[c] : v))
    )
  }
  return { labels, centroids }
}

function silhouetteScore(
  points: number[][],
  labels: number[],
  k: number
): number {
  const n = points.length
  let total = 0
  for (let i = 0; i < n; i++) {
    const cluster = labels[i]
    let a = 0
    let aCount = 0
    let b = Infinity
    const otherClusters = new Set<number>()
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d = euclidean(points[i], points[j])
      if (labels[j] === cluster) {
        a += d
        aCount++
      } else otherClusters.add(labels[j])
    }
    a = aCount ? a / aCount : 0
    for (const oc of otherClusters) {
      let sum = 0
      let count = 0
      for (let j = 0; j < n; j++) {
        if (labels[j] === oc) {
          sum += euclidean(points[i], points[j])
          count++
        }
      }
      const avg = count ? sum / count : 0
      if (avg < b) b = avg
    }
    if (b === Infinity) b = 0
    const s = Math.max(a, b) === 0 ? 0 : (b - a) / Math.max(a, b)
    total += s
  }
  return n ? total / n : 0
}

function translateClusterToSegment(
  clusterId: number,
  centroids: number[][],
  featureMeans: number[],
  featureStds: number[]
): string {
  const c = centroids[clusterId] || []
  const revRecency = (c[0] ?? 0) * (featureStds[0] || 1) + (featureMeans[0] ?? 0)
  const freq = (c[1] ?? 0) * (featureStds[1] || 1) + (featureMeans[1] ?? 0)
  const mon = (c[2] ?? 0) * (featureStds[2] || 1) + (featureMeans[2] ?? 0)
  if (revRecency < 0 && freq > 0 && mon > 0) return "High-Value Active"
  if (revRecency > 0 && freq < 0) return "Dormant or New"
  if (mon > 0 && freq > 0) return "Frequent Spenders"
  if (mon < 0 && freq < 0) return "Low Engagement"
  return "Mid-Value Regulars"
}

// ——— 4. Apriori / Association rules ———
function getBaskets(transactions: TransactionRow[]): string[][] {
  const byOrder = new Map<string, Set<string>>()
  for (const t of transactions) {
    const key = `${t.customerId}_${t.date.toISOString().slice(0, 10)}`
    let set = byOrder.get(key)
    if (!set) {
      set = new Set()
      byOrder.set(key, set)
    }
    set.add(t.category)
  }
  return Array.from(byOrder.values()).map((s) => Array.from(s))
}

function aprioriFrequent(
  baskets: string[][],
  minSupport: number
): Map<string, number> {
  const itemCounts = new Map<string, number>()
  for (const basket of baskets) {
    for (const item of basket) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
    }
  }
  const n = baskets.length
  const frequent = new Map<string, number>()
  for (const [item, count] of itemCounts) {
    const sup = count / n
    if (sup >= minSupport) frequent.set(item, sup)
  }
  return frequent
}

function generateRules(
  baskets: string[][],
  minSupport: number,
  minConfidence: number,
  minLift: number,
  topN: number
): AffinityRule[] {
  const n = baskets.length
  const itemCounts = new Map<string, number>()
  const pairCounts = new Map<string, number>()
  for (const basket of baskets) {
    const uniq = [...new Set(basket)]
    for (const item of uniq) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
    }
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const key = [uniq[i], uniq[j]].sort().join("|")
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1)
      }
    }
  }
  const rules: AffinityRule[] = []
  for (const [key, count] of pairCounts) {
    const [a, b] = key.split("|")
    const support = count / n
    if (support < minSupport) continue
    const countA = itemCounts.get(a) || 0
    const countB = itemCounts.get(b) || 0
    const confAB = countA ? count / countA : 0
    const confBA = countB ? count / countB : 0
    const supportB = countB / n
    const supportA = countA / n
    const liftAB = supportB ? confAB / supportB : 0
    const liftBA = supportA ? confBA / supportA : 0
    if (liftAB > minLift && confAB >= minConfidence) {
      rules.push({
        antecedent: [a],
        consequent: [b],
        support,
        confidence: confAB,
        lift: liftAB,
        interpretation: `Customers who buy ${a} are ${(liftAB * 100 - 100).toFixed(0)}% more likely to also buy ${b} (confidence: ${(confAB * 100).toFixed(1)}%).`,
      })
    }
    if (liftBA > minLift && confBA >= minConfidence && a !== b) {
      rules.push({
        antecedent: [b],
        consequent: [a],
        support,
        confidence: confBA,
        lift: liftBA,
        interpretation: `Customers who buy ${b} are ${(liftBA * 100 - 100).toFixed(0)}% more likely to also buy ${a} (confidence: ${(confBA * 100).toFixed(1)}%).`,
      })
    }
  }
  rules.sort((x, y) => y.lift - x.lift)
  return rules.slice(0, topN)
}

// ——— 5. Behavioral patterns ———
function assignBehaviorType(c: CustomerFeatures): string {
  const { recency, frequency, monetary, categoryDiversity } = c
  const avgMon = monetary / Math.max(1, frequency)
  if (frequency >= 8 && categoryDiversity <= 2) return "Category loyalist"
  if (categoryDiversity >= 4) return "Cross-category buyer"
  if (frequency >= 6 && avgMon < 50) return "High-frequency low-spend"
  if (frequency <= 2 && monetary > 200) return "Low-frequency high-spend"
  if (recency <= 30 && frequency >= 4) return "Seasonal shopper"
  return "Regular buyer"
}

// ——— Main entry ———
export function runBehaviorAnalysis(
  cleaned: DataRow[],
  mapping: ColumnMapping
): BehaviorResults | null {
  if (!mapping.customerId) return null

  const transactions = prepareTransactions(cleaned, mapping)
  if (transactions.length === 0) return null

  const maxDate = new Date(
    Math.max(...transactions.map((t) => t.date.getTime()))
  )
  const minDate = new Date(
    Math.min(...transactions.map((t) => t.date.getTime()))
  )
  const byCustomer = aggregateByCustomer(transactions)
  const rfmMap = computeRFM(byCustomer, maxDate)

  const recencies = [...rfmMap.values()].map((v) => v.recency)
  const frequencies = [...rfmMap.values()].map((v) => v.frequency)
  const monetaries = [...rfmMap.values()].map((v) => v.monetary)
  const recNorm = standardize(recencies)
  const freqNorm = standardize(frequencies)
  const monNorm = standardize(monetaries)

  const customerIds = [...rfmMap.keys()]
  const rfmScores: number[] = []
  const rfmSegments: string[] = []
  for (let i = 0; i < customerIds.length; i++) {
    const r = 1 - (recNorm[i] - Math.min(...recNorm)) / (Math.max(...recNorm) - Math.min(...recNorm) || 1)
    const f = (freqNorm[i] - Math.min(...freqNorm)) / (Math.max(...freqNorm) - Math.min(...freqNorm) || 1)
    const m = (monNorm[i] - Math.min(...monNorm)) / (Math.max(...monNorm) - Math.min(...monNorm) || 1)
    const rTier = scoreToTier(r)
    const fTier = scoreToTier(f)
    const mTier = scoreToTier(m)
    rfmScores.push((rTier + fTier + mTier) / 3)
    rfmSegments.push(getRFMSegment(rTier, fTier, mTier))
  }

  const segmentCounts = new Map<string, number>()
  const segmentRevenue = new Map<string, number>()
  customerIds.forEach((cid, i) => {
    const seg = rfmSegments[i]
    segmentCounts.set(seg, (segmentCounts.get(seg) || 0) + 1)
    segmentRevenue.set(
      seg,
      (segmentRevenue.get(seg) || 0) + (rfmMap.get(cid)?.monetary ?? 0)
    )
  })
  const totalRevenue = [...segmentRevenue.values()].reduce((a, b) => a + b, 0)
  const rfmSegmentSummaries: RFMSegmentSummary[] = []
  const segmentOrder = [
    "Champions",
    "Loyal Customers",
    "Potential Loyalists",
    "At Risk",
    "Lost",
  ]
  for (const seg of segmentOrder) {
    const count = segmentCounts.get(seg) || 0
    const rev = segmentRevenue.get(seg) || 0
    rfmSegmentSummaries.push({
      segment: seg,
      count,
      revenue: Math.round(rev),
      revenueShare: totalRevenue ? (rev / totalRevenue) * 100 : 0,
      description: RFM_SEGMENTS[seg] || seg,
    })
  }
  const rfmPieData = rfmSegmentSummaries
    .filter((s) => s.count > 0)
    .map((s, i) => ({
      name: s.segment,
      value: s.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  const rfmRevenuePie = rfmSegmentSummaries
    .filter((s) => s.revenue > 0)
    .map((s, i) => ({
      name: s.segment,
      value: s.revenue,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))

  const monthSegCounts = new Map<string, Map<string, Set<string>>>()
  transactions.forEach((t) => {
    const monthKey = t.date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    const cid = t.customerId
    const seg = rfmSegments[customerIds.indexOf(cid)]
    if (!monthSegCounts.has(monthKey)) {
      monthSegCounts.set(monthKey, new Map())
    }
    const m = monthSegCounts.get(monthKey)!
    if (!m.has(seg)) m.set(seg, new Set())
    m.get(seg)!.add(cid)
  })
  const months = [...monthSegCounts.keys()].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )
  const rfmTrend: RFMTrendPoint[] = months.map((month) => {
    const row: RFMTrendPoint = { period: month }
    const m = monthSegCounts.get(month)!
    segmentOrder.forEach((seg) => {
      row[seg] = m.get(seg)?.size ?? 0
    })
    return row
  })

  const rfmInterpretation = `RFM analysis of ${customerIds.length} customers shows segment distribution and revenue contribution. Champions and Loyal Customers together drive the largest share of revenue. Segment trend over time reflects changes in customer engagement.`

  // ——— Clustering ———
  const featureMatrix = customerIds.map((cid) => {
    const r = byCustomer.get(cid)!
    const lastDate = new Date(Math.max(...r.dates.map((d) => d.getTime())))
    const recency = Math.floor(
      (maxDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    )
    const frequency = r.dates.length
    const monetary = r.total
    const avgBasket = r.total / r.dates.length
    const categoryDiversity = r.categories.size
    const amounts = r.amounts
    const meanAmount =
      amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1)
    const variance =
      amounts.reduce((a, b) => a + (b - meanAmount) ** 2, 0) /
      (amounts.length || 1)
    const consistency = Math.sqrt(variance) || 1
    const purchaseConsistency = 1 / (1 + consistency / 50)
    return [
      recency,
      frequency,
      monetary,
      avgBasket,
      categoryDiversity,
      purchaseConsistency,
    ]
  })
  const featMeans = [0, 0, 0, 0, 0, 0]
  const featStds = [1, 1, 1, 1, 1, 1]
  for (let j = 0; j < 6; j++) {
    const col = featureMatrix.map((r) => r[j])
    featMeans[j] = col.reduce((a, b) => a + b, 0) / col.length
    const variance =
      col.reduce((a, b) => a + (b - featMeans[j]) ** 2, 0) / col.length
    featStds[j] = Math.sqrt(variance) || 1
  }
  const normalized = featureMatrix.map((row) =>
    row.map((v, j) => (v - featMeans[j]) / featStds[j])
  )
  let bestK = 2
  let bestSil = -1
  for (let k = 2; k <= Math.min(6, Math.floor(customerIds.length / 10)); k++) {
    const { labels } = kMeans(normalized, k)
    const sil = silhouetteScore(normalized, labels, k)
    if (sil > bestSil) {
      bestSil = sil
      bestK = k
    }
  }
  const { labels: clusterLabels, centroids } = kMeans(normalized, bestK)
  const rawNames = centroids.map((_, id) =>
    translateClusterToSegment(id, centroids, featMeans, featStds)
  )
  const nameCounts = new Map<string, number>()
  const clusterNames = rawNames.map((name) => {
    const count = (nameCounts.get(name) ?? 0) + 1
    nameCounts.set(name, count)
    return count > 1 ? `${name} (${count})` : name
  })
  const customerFeatures: CustomerFeatures[] = customerIds.map((cid, i) => {
    const r = byCustomer.get(cid)!
    const lastDate = new Date(Math.max(...r.dates.map((d) => d.getTime())))
    const recency = Math.floor(
      (maxDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    )
    return {
      customerId: cid,
      recency,
      frequency: r.dates.length,
      monetary: r.total,
      avgBasketSize: r.total / r.dates.length,
      categoryDiversity: r.categories.size,
      purchaseConsistency:
        1 / (1 + (r.amounts.reduce((a, b) => a + (b - r.total / r.dates.length) ** 2, 0) / r.dates.length) ** 0.5 / 50),
      rfmScore: rfmScores[i],
      rfmSegment: rfmSegments[i],
      clusterId: clusterLabels[i],
      clusterLabel: clusterNames[clusterLabels[i]],
      behaviorType: "",
    }
  })
  customerFeatures.forEach((c) => {
    c.behaviorType = assignBehaviorType(c)
  })

  const clusterSummaries: ClusterSegmentSummary[] = clusterNames.map(
    (name, id) => {
      const indices = clusterLabels
        .map((l, i) => (l === id ? i : -1))
        .filter((i) => i >= 0)
      const count = indices.length
      const totalMon = indices.reduce(
        (s, i) => s + (rfmMap.get(customerIds[i])?.monetary ?? 0),
        0
      )
      return {
        segment: name,
        count,
        avgSpend: count ? Math.round(totalMon / count) : 0,
        revenueShare: totalRevenue ? (totalMon / totalRevenue) * 100 : 0,
        description: `Cluster ${id + 1}: ${name}. Average spend and revenue share derived from clustering.`,
      }
    }
  )
  const clusterPie = clusterSummaries
    .filter((s) => s.count > 0)
    .map((s, i) => ({
      name: s.segment,
      value: s.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  const clusterRevenuePie = clusterSummaries
    .filter((s) => s.count > 0)
    .map((s, i) => ({
      name: s.segment,
      value: Math.round((s.avgSpend * s.count)),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  const clusterTrendMap = new Map<string, Map<string, Set<string>>>()
  transactions.forEach((t) => {
    const monthKey = t.date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    const idx = customerIds.indexOf(t.customerId)
    if (idx < 0) return
    const seg = clusterNames[clusterLabels[idx]]
    if (!clusterTrendMap.has(monthKey)) {
      clusterTrendMap.set(monthKey, new Map())
    }
    const m = clusterTrendMap.get(monthKey)!
    if (!m.has(seg)) m.set(seg, new Set())
    m.get(seg)!.add(t.customerId)
  })
  const clusterTrend = [...clusterTrendMap.keys()]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((period) => {
      const row: { period: string; [key: string]: string | number } = {
        period,
      }
      clusterNames.forEach((name) => {
        row[name] = clusterTrendMap.get(period)?.get(name)?.size ?? 0
      })
      return row
    })
  const clusteringInterpretation = `K-Means clustering identified ${bestK} segments. Segment sizes and average spend vary; revenue share reflects each segment's contribution to total revenue. Trends over time show how segment composition evolves.`

  // ——— Affinity ———
  const baskets = getBaskets(transactions)
  const minSup = Math.max(0.02, 2 / baskets.length)
  const topRules = generateRules(
    baskets,
    minSup,
    0.15,
    1,
    5
  )
  const affinityInterpretation =
    topRules.length > 0
      ? `Top association rules (lift > 1) show which categories are often bought together. Use these for bundling and cross-sell.`
      : `Insufficient basket diversity or size for strong association rules; consider lowering support or adding more transaction data.`

  // ——— Behavioral ———
  const behaviorCounts = new Map<string, number>()
  customerFeatures.forEach((c) => {
    behaviorCounts.set(
      c.behaviorType,
      (behaviorCounts.get(c.behaviorType) || 0) + 1
    )
  })
  const totalC = customerFeatures.length
  const insights: BehavioralInsight[] = [
    "Category loyalist",
    "Cross-category buyer",
    "High-frequency low-spend",
    "Low-frequency high-spend",
    "Seasonal shopper",
    "Regular buyer",
  ].map((type) => ({
    type,
    count: behaviorCounts.get(type) || 0,
    share: totalC ? ((behaviorCounts.get(type) || 0) / totalC) * 100 : 0,
    description:
      type === "Category loyalist"
        ? "Customers who frequently buy from one or two categories."
        : type === "Cross-category buyer"
          ? "Customers who spread purchases across many categories."
          : type === "High-frequency low-spend"
            ? "Many small transactions."
            : type === "Low-frequency high-spend"
              ? "Few but high-value transactions."
              : type === "Seasonal shopper"
                ? "Recent and fairly frequent; seasonal pattern."
                : "Moderate frequency and spend.",
    trend: "stable" as const,
  }))
  const dominant = [...behaviorCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const behavioralInterpretation = `Behavioral analysis shows ${dominant?.[0] ?? "diverse"} as the most common pattern. Insights are derived from recency, frequency, monetary, and category diversity in the dataset.`

  return {
    dataPrep: {
      totalTransactions: transactions.length,
      uniqueCustomers: customerIds.length,
      dateRange: {
        start: minDate.toISOString().slice(0, 10),
        end: maxDate.toISOString().slice(0, 10),
      },
    },
    rfm: {
      segmentDistribution: rfmPieData,
      revenueBySegment: rfmRevenuePie,
      segmentTrend: rfmTrend,
      segmentSummaries: rfmSegmentSummaries,
      interpretation: rfmInterpretation,
    },
    clustering: {
      segmentDistribution: clusterPie,
      avgSpendBySegment: clusterSummaries.map((s) => ({
        segment: s.segment,
        avgSpend: s.avgSpend,
      })),
      revenueShareBySegment: clusterRevenuePie,
      segmentTrend: clusterTrend,
      segmentSummaries: clusterSummaries,
      interpretation: clusteringInterpretation,
    },
    affinity: {
      topRules,
      interpretation: affinityInterpretation,
    },
    behavioral: {
      insights: insights.filter((i) => i.count > 0),
      dominantType: dominant?.[0] ?? "N/A",
      fastestGrowing: "Derived from segment trend; see line chart.",
      decliningSegment: "See segment trend over time.",
      emergingPattern:
        topRules[0]?.antecedent.concat(topRules[0]?.consequent || []).join(" + ") || "N/A",
      interpretation: behavioralInterpretation,
    },
  }
}
