"use client"

import {
  LayoutDashboard,
  TrendingUp,
  GitCompareArrows,
  Upload,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AppView } from "@/lib/types"

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: AppView }[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: TrendingUp, label: "Forecast", view: "forecast" },
  { icon: GitCompareArrows, label: "Comparison", view: "comparison" },
  { icon: Users, label: "Shopper Behavior", view: "behavior" },
  { icon: Upload, label: "Upload Data", view: "upload" },
  { icon: Settings, label: "Settings", view: "settings" },
]

export function AppSidebar({ open }: { open: boolean }) {
  const { view, setView, toggleSidebar } = useAppStore()

  const handleBackToHome = () => {
    window.location.href = '/'
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 md:relative",
          "bg-sidebar border-sidebar-border",
          open ? "w-56" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img src="/icon.svg" alt="ShopIQ Logo" className="h-5 w-5" />
          </div>
          {open && (
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
              ShopIQ
            </span>
          )}
        </div>

        {/* Nav Items */}
        {/* Navigation is mapped above */}
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.view
            return (
              <Tooltip key={item.view}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView(item.view)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {open && <span>{item.label}</span>}
                  </button>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center mb-2"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          {/* Back to Home Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {open && <span>Back to Home</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
