"use client"

import { useState, useCallback } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import {
  parseCSV,
  validateData,
  cleanData,
  engineerFeatures,
  trainModel,
  generateKPIs,
} from "@/lib/data-processing"
import type { ProcessingStep, DataRow, ColumnMapping } from "@/lib/types"

const STEPS: { key: ProcessingStep; label: string; description: string }[] = [
  { key: "upload", label: "Upload", description: "Select your CSV file" },
  { key: "validation", label: "Validate", description: "Schema & field validation" },
  { key: "cleaning", label: "Clean", description: "Remove nulls, duplicates, outliers" },
  { key: "engineering", label: "Features", description: "Derive analytics features" },
  { key: "training", label: "Train", description: "Build & evaluate ML model" },
  { key: "complete", label: "Complete", description: "Dashboard ready" },
]

export function UploadView() {
  const {
    setUserData,
    setForecast,
    setModelMetrics,
    setKPIs,
    setView,
    setMode,
  } = useAppStore()

  const [currentStep, setCurrentStep] = useState<ProcessingStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<DataRow[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [cleaningStats, setCleaningStats] = useState<{
    removedNulls: number
    removedDuplicates: number
    outliers: number
    cleanedCount: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    setIsProcessing(true)
    setProgress(10)

    try {
      const data = await parseCSV(f)
      setRawData(data)
      setProgress(30)

      // Step 2: Validation
      const result = validateData(data, f)
      setProgress(50)

      if (!result.isValid) {
        setValidationErrors(result.errors.map((e) => e.message))
        setValidationWarnings(result.warnings)
        setCurrentStep("validation")
        setIsProcessing(false)
        return
      }

      setColumnMapping(result.columnMapping)
      setValidationErrors([])
      setValidationWarnings(result.warnings)
      setCurrentStep("validation")
      setIsProcessing(false)
    } catch {
      toast.error("Failed to parse CSV file.")
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const runCleaning = useCallback(async () => {
    if (!columnMapping) return
    setIsProcessing(true)
    setCurrentStep("cleaning")
    setProgress(20)

    await new Promise((r) => setTimeout(r, 800))
    const { cleaned, stats } = cleanData(rawData, columnMapping)
    setRawData(cleaned)
    setCleaningStats({ ...stats, cleanedCount: cleaned.length })
    setProgress(100)
    setIsProcessing(false)
  }, [rawData, columnMapping])

  const runEngineering = useCallback(async () => {
    if (!columnMapping) return
    setIsProcessing(true)
    setCurrentStep("engineering")
    setProgress(20)

    await new Promise((r) => setTimeout(r, 1000))
    setProgress(60)
    const features = engineerFeatures(rawData, columnMapping)
    setProgress(100)
    setIsProcessing(false)

    // Store features for training step
    ;(window as unknown as Record<string, unknown>).__tempFeatures = features
  }, [rawData, columnMapping])

  const runTraining = useCallback(async () => {
    setIsProcessing(true)
    setCurrentStep("training")
    setProgress(10)

    const features = (window as unknown as Record<string, unknown>).__tempFeatures as ReturnType<typeof engineerFeatures>
    if (!features) {
      toast.error("No features available. Please re-run engineering step.")
      setIsProcessing(false)
      return
    }

    // Simulated training with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 300))
      setProgress(i)
    }

    const { forecast, metrics } = trainModel(features, rawData.length)
    const kpis = generateKPIs(features, forecast)

    setUserData({
      raw: rawData,
      cleaned: rawData,
      features,
      columnMapping: columnMapping ?? undefined,
      summary: {
        totalRows: rawData.length,
        cleanedRows: cleaningStats?.cleanedCount || rawData.length,
        removedDuplicates: cleaningStats?.removedDuplicates || 0,
        removedNulls: cleaningStats?.removedNulls || 0,
        outliers: cleaningStats?.outliers || 0,
        columns: Object.keys(rawData[0] || {}),
        dateRange: { start: "auto", end: "auto" },
      },
    })

    setForecast(forecast)
    setModelMetrics(metrics)
    setKPIs(kpis)
    setCurrentStep("complete")
    setIsProcessing(false)
    setMode("analysis")
  }, [rawData, cleaningStats, setUserData, setForecast, setModelMetrics, setKPIs, setMode])

  const goToDashboard = () => {
    setView("dashboard")
    toast.success("Dashboard generated from your dataset!")
  }

  const reset = () => {
    setFile(null)
    setRawData([])
    setColumnMapping(null)
    setValidationErrors([])
    setValidationWarnings([])
    setCleaningStats(null)
    setCurrentStep("upload")
    setProgress(0)
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i < stepIndex
                  ? "bg-accent text-accent-foreground"
                  : i === stepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < stepIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 w-8 sm:block ${
                  i < stepIndex ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {currentStep === "upload" && (
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardContent className="p-8">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="rounded-xl bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                Upload your dataset
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag and drop a CSV file, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Max 10MB. Required columns: Category, Purchase Amount, Date
              </p>
              <label className="mt-6 cursor-pointer">
                <Button asChild>
                  <span>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Select CSV File
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Validation */}
      {currentStep === "validation" && (
        <div className="space-y-4">
          <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Validation Results
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rawData.length.toLocaleString()} rows | {((file?.size || 0) / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Errors */}
              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {validationWarnings.length > 0 && (
                <div className="space-y-2">
                  {validationWarnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-chart-3/10 p-3 text-sm text-chart-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Column Mapping */}
              {columnMapping && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Column Mapping
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(columnMapping).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="text-sm font-medium text-card-foreground">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {rawData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data Preview (first 5 rows)
                  </p>
                  <div className="overflow-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-secondary/50">
                          {Object.keys(rawData[0]).slice(0, 6).map((col) => (
                            <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rawData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            {Object.values(row).slice(0, 6).map((val, j) => (
                              <td key={j} className="px-3 py-2 text-card-foreground">
                                {String(val ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action */}
              {validationErrors.length === 0 && columnMapping && (
                <Button onClick={runCleaning} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Proceed to Data Cleaning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {validationErrors.length > 0 && (
                <Button onClick={reset} variant="outline" className="w-full">
                  Upload a Different File
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Cleaning */}
      {currentStep === "cleaning" && (
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Data Cleaning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cleaning dataset...</p>
                <Progress value={progress} className="w-64" />
              </div>
            ) : cleaningStats ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Null Rows Removed" value={cleaningStats.removedNulls} />
                  <StatCard label="Duplicates Removed" value={cleaningStats.removedDuplicates} />
                  <StatCard label="Outliers Removed" value={cleaningStats.outliers} />
                  <StatCard label="Clean Rows" value={cleaningStats.cleanedCount} accent />
                </div>
                <Button onClick={runEngineering} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Feature Engineering
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Feature Engineering */}
      {currentStep === "engineering" && (
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Feature Engineering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Deriving features: monthly revenue, frequency, growth rate, rolling averages...
                </p>
                <Progress value={progress} className="w-64" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Monthly Aggregated Revenue",
                    "Purchase Frequency",
                    "Growth Rate",
                    "Rolling Averages",
                    "Category Revenue Ratio",
                    "Trend Slope",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      <span className="text-sm text-card-foreground">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={runTraining} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Train ML Model
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Training */}
      {currentStep === "training" && (
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-card-foreground">
              Model Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Training regression model with cross-validation...
              </p>
              <Progress value={progress} className="w-64" />
              <p className="text-xs text-muted-foreground">
                {progress < 30
                  ? "Preparing data merge..."
                  : progress < 60
                    ? "Training regression model..."
                    : progress < 90
                      ? "Running cross-validation..."
                      : "Generating evaluation metrics..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Complete */}
      {currentStep === "complete" && (
        <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="rounded-full bg-accent/10 p-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Analysis Complete
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Your dataset has been processed, features engineered, and ML model trained.
              The dashboard is ready with your custom analytics.
            </p>
            <Button onClick={goToDashboard} size="lg" className="mt-2">
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold font-mono ${
          accent ? "text-accent" : "text-card-foreground"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  )
}


