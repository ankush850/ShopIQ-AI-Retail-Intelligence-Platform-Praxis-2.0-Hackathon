"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { Settings, Database, Cpu, Palette } from "lucide-react"

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { mode, modelMetrics, activeData } = useAppStore()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Platform configuration and system information
        </p>
      </div>

      {/* Appearance */}
      <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-card-foreground">
              Appearance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm text-card-foreground">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Dataset Info */}
      <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-card-foreground">
              Dataset Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Mode</span>
            <Badge variant="secondary" className="border-border/60 text-foreground">
              {mode === "prebuilt" ? "Prebuilt" : "Analysis"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Rows</span>
            <span className="text-sm font-mono text-foreground">
              {activeData?.summary.totalRows.toLocaleString() || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Clean Rows</span>
            <span className="text-sm font-mono text-card-foreground">
              {activeData?.summary.cleanedRows.toLocaleString() || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Columns</span>
            <span className="text-sm font-mono text-card-foreground">
              {activeData?.summary.columns.length || "--"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Model Info */}
      <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-card-foreground">
              Model Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {modelMetrics ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline" className="font-mono border-border/60 text-foreground">
                  {modelMetrics.version}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  R{"\u00B2"} Score
                </span>
                <span className="text-sm font-mono text-[#06ffa5]">
                  {modelMetrics.r2.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">RMSE</span>
                <span className="text-sm font-mono text-card-foreground">
                  {modelMetrics.rmse.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MAE</span>
                <span className="text-sm font-mono text-card-foreground">
                  {modelMetrics.mae.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Training Samples
                </span>
                <span className="text-sm font-mono text-card-foreground">
                  {modelMetrics.datasetSize.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Trained
                </span>
                <span className="text-sm text-card-foreground">
                  {new Date(modelMetrics.trainedAt).toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No model trained yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
