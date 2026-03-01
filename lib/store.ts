import { create } from "zustand"
import type {
  AppMode,
  AppView,
  ProcessedData,
  ForecastData,
  ModelMetrics,
  KPIData,
  ChatMessage,
  ProcessingStep,
  ValidationResult,
  ColumnMapping,
  BehaviorResults,
} from "./types"
import { generatePrebuiltData } from "./prebuilt-data"
import { runBehaviorAnalysis } from "./behavior-analysis"

interface AppState {
  // Mode & Navigation
  mode: AppMode
  view: AppView
  sidebarOpen: boolean
  assistantOpen: boolean

  // Data
  prebuiltData: ProcessedData | null
  userData: ProcessedData | null
  activeData: ProcessedData | null

  // Processing
  processingStep: ProcessingStep | null
  processingProgress: number
  validationResult: ValidationResult | null
  columnMapping: ColumnMapping | null
  rawFile: File | null

  // ML & Forecast
  forecast: ForecastData | null
  modelMetrics: ModelMetrics | null
  kpis: KPIData | null

  // Shopper Behavior & Affinity
  behaviorResults: BehaviorResults | null

  // AI Assistant
  chatMessages: ChatMessage[]
  isAssistantTyping: boolean

  // Actions
  setMode: (mode: AppMode) => void
  setView: (view: AppView) => void
  toggleSidebar: () => void
  toggleAssistant: () => void
  initializePrebuiltData: () => void
  setUserData: (data: ProcessedData) => void
  setProcessingStep: (step: ProcessingStep | null) => void
  setProcessingProgress: (progress: number) => void
  setValidationResult: (result: ValidationResult | null) => void
  setColumnMapping: (mapping: ColumnMapping | null) => void
  setRawFile: (file: File | null) => void
  setForecast: (forecast: ForecastData | null) => void
  setModelMetrics: (metrics: ModelMetrics | null) => void
  setKPIs: (kpis: KPIData | null) => void
  setBehaviorResults: (results: BehaviorResults | null) => void
  runBehaviorAnalysisIfNeeded: () => void
  addChatMessage: (message: ChatMessage) => void
  setAssistantTyping: (typing: boolean) => void
  switchToAnalysisMode: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: "prebuilt",
  view: "dashboard",
  sidebarOpen: true,
  assistantOpen: false,

  prebuiltData: null,
  userData: null,
  activeData: null,

  processingStep: null,
  processingProgress: 0,
  validationResult: null,
  columnMapping: null,
  rawFile: null,

  forecast: null,
  modelMetrics: null,
  kpis: null,
  behaviorResults: null,

  chatMessages: [],
  isAssistantTyping: false,

  setMode: (mode) => {
    const state = get()
    const activeData = mode === "prebuilt" ? state.prebuiltData : state.userData
    set({ mode, activeData })
  },

  setView: (view) => set({ view }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),

  initializePrebuiltData: () => {
    const { data, forecast, metrics, kpis } = generatePrebuiltData()
    const behaviorResults = data?.columnMapping?.customerId
      ? runBehaviorAnalysis(data.cleaned, data.columnMapping)
      : null
    set({
      prebuiltData: data,
      activeData: data,
      forecast,
      modelMetrics: metrics,
      kpis,
      behaviorResults: behaviorResults ?? null,
    })
  },

  setUserData: (data) => set({ userData: data, activeData: data }),
  setProcessingStep: (step) => set({ processingStep: step }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setValidationResult: (result) => set({ validationResult: result }),
  setColumnMapping: (mapping) => set({ columnMapping: mapping }),
  setRawFile: (file) => set({ rawFile: file }),
  setForecast: (forecast) => set({ forecast }),
  setModelMetrics: (metrics) => set({ modelMetrics: metrics }),
  setKPIs: (kpis) => set({ kpis }),
  setBehaviorResults: (results) => set({ behaviorResults: results }),
  runBehaviorAnalysisIfNeeded: () => {
    const state = get()
    const data = state.activeData
    const mapping = data?.columnMapping
    if (!data?.cleaned?.length || !mapping?.customerId) {
      set({ behaviorResults: null })
      return
    }
    const results = runBehaviorAnalysis(data.cleaned, mapping)
    set({ behaviorResults: results ?? null })
  },
  addChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  setAssistantTyping: (typing) => set({ isAssistantTyping: typing }),

  switchToAnalysisMode: () => {
    set({ mode: "analysis", view: "upload" })
  },
}))
