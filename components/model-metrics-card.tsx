"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ModelMetrics } from "@/lib/types"

interface ModelMetricsCardProps {
  metrics: ModelMetrics
}

export function ModelMetricsCard({ metrics }: ModelMetricsCardProps) {
  const r2Color =
    metrics.r2 >= 0.8
      ? "text-accent"
      : metrics.r2 >= 0.6
        ? "text-chart-3"
        : "text-destructive"

  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-card-foreground">
            Model Evaluation
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono border-border text-foreground">
            {metrics.version}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              RMSE
            </p>
            <p className="text-lg font-semibold font-mono text-card-foreground">
              {metrics.rmse.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              MAE
            </p>
            <p className="text-lg font-semibold font-mono text-card-foreground">
              {metrics.mae.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              R{"\u00B2"} Score
            </p>
            <p className={`text-lg font-semibold font-mono ${r2Color}`}>
              {metrics.r2.toFixed(3)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Model Accuracy</span>
            <span>{(metrics.r2 * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(metrics.r2 * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Trained on {metrics.datasetSize.toLocaleString()} samples
          </span>
          <span>
            {new Date(metrics.trainedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
