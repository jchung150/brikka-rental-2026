"use client"

import * as React from "react"
import { cn } from "@repo/design-system/lib/utils"

interface SimpleTabsProps {
  tab: string
  setTab: (tab: string) => void
  tabs: Array<{
    id: string
    label: string
  }>
  className?: string
}

export function SimpleTabs({ tab, setTab, tabs, className }: SimpleTabsProps) {
  return (
    <div className={cn("border-gray-200 border-b", className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            className={cn(
              "border-b-2 px-1 py-2 font-medium text-sm transition-colors",
              tab === tabItem.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
            type="button"
            onClick={() => setTab(tabItem.id)}
          >
            {tabItem.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
