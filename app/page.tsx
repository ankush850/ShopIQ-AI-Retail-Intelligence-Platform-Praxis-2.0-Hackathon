"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { AppShell } from "@/components/app-shell"

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)

  const handleLaunchDashboard = () => {
    setShowDashboard(true)
  }

  if (showDashboard) {
    return <AppShell />
  }

  return <LandingPage onLaunchDashboard={handleLaunchDashboard} />
}
