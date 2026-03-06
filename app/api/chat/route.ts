import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
} from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    dataContext,
  }: {
    messages: UIMessage[]
    dataContext?: {
      mode: string
      totalRevenue: number
      monthlyGrowth: number
      topCategory: string
      categories: string[]
      monthlyRevenue: { month: string; revenue: number }[]
      modelR2: number
      forecastSummary: string
      rowCount: number
    }
  } = await req.json()

  const systemPrompt = `You are ShopIQ's AI analytics assistant. You help users understand their shopping data, forecasts, and model metrics.

RULES:
- All responses must be grounded in the dataset provided. Never hallucinate or make up data.
- If you don't have enough data to answer, say so explicitly.
- Be concise and analytical in your responses.
- When discussing numbers, format them clearly with currency symbols and percentages.
- You can suggest the user look at specific views (Dashboard, Forecast, Comparison) for deeper analysis.

${
  dataContext
    ? `CURRENT DATASET CONTEXT:
- Mode: ${dataContext.mode}
- Total Revenue: $${dataContext.totalRevenue.toLocaleString()}
- Monthly Growth: ${dataContext.monthlyGrowth}%
- Top Category: ${dataContext.topCategory}
- Categories: ${dataContext.categories.join(", ")}
- Monthly Revenue Data: ${JSON.stringify(dataContext.monthlyRevenue.slice(-6))}
- Model R² Score: ${dataContext.modelR2}
- Forecast: ${dataContext.forecastSummary}
- Dataset Size: ${dataContext.rowCount} rows`
    : "No dataset is currently loaded. Suggest the user load the prebuilt dataset or upload a CSV."
}`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    tools: {
      analyzeCategory: tool({
        description:
          "Analyze a specific product category from the dataset",
        inputSchema: z.object({
          categoryName: z.string().describe("The category to analyze"),
        }),
        execute: async ({ categoryName }) => {
          if (!dataContext) return { error: "No dataset loaded" }
          const found = dataContext.categories.find(
            (c) => c.toLowerCase() === categoryName.toLowerCase()
          )
          if (!found) {
            return {
              error: `Category "${categoryName}" not found. Available: ${dataContext.categories.join(", ")}`,
            }
          }
          return {
            category: found,
            totalRevenue: dataContext.totalRevenue,
            isTopCategory: found === dataContext.topCategory,
          }
        },
      }),
      getRevenueTrend: tool({
        description: "Get the monthly revenue trend data",
        inputSchema: z.object({
          lastN: z
            .number()
            .nullable()
            .describe("Number of recent months to return, or null for all"),
        }),
        execute: async ({ lastN }) => {
          if (!dataContext) return { error: "No dataset loaded" }
          const data = lastN
            ? dataContext.monthlyRevenue.slice(-lastN)
            : dataContext.monthlyRevenue
          return { months: data, count: data.length }
        },
      }),
    },
    maxSteps: 3,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  })
}
