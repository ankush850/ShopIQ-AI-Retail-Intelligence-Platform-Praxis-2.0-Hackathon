"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { ProcessedData } from "@/lib/types"

interface CategoryPieChartProps {
  data: ProcessedData["features"]["categoryDistribution"]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          Category Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                  color: "var(--card-foreground)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
