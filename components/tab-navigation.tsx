"use client"

import { Button } from "@/components/ui/button"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "metricas", label: "Métricas" },
    { id: "noticias", label: "Noticias" },
    { id: "pronostico", label: "Pronóstico" },
    { id: "foro", label: "Foro" },
    { id: "foro-academico", label: "Foro Académico" },
    { id: "ubicacion", label: "Ubicación" },
  ]

  return (
    <div className="border-b border-stone-200">
      <nav className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-none border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                : "border-transparent text-stone-600 hover:text-stone-800 hover:border-stone-300"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </nav>
    </div>
  )
}
