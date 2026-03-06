"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { DashboardView } from "@/components/views/dashboard-view"
import { ForecastView } from "@/components/views/forecast-view"
import { ComparisonView } from "@/components/views/comparison-view"
import { UploadView } from "@/components/views/upload-view"
import { SettingsView } from "@/components/views/settings-view"
import { BehaviorView } from "@/components/views/behavior-view"

export function AppShell() {
  const { view, sidebarOpen, initializePrebuiltData } =
    useAppStore()

  useEffect(() => {
    initializePrebuiltData()
  }, [initializePrebuiltData])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <AppSidebar open={sidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {view === "dashboard" && <DashboardView />}
            {view === "forecast" && <ForecastView />}
            {view === "comparison" && <ComparisonView />}
            {view === "behavior" && <BehaviorView />}
            {view === "upload" && <UploadView />}
            {view === "settings" && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Right AI Panel (Removed) */}
    </div>
  )
}
