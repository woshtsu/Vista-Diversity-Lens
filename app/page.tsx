"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SpeciesCard } from "@/components/species-card"
import { TabNavigation } from "@/components/tab-navigation"
import { AcademicForum } from "@/components/academic-forum"
import { ComingSoon } from "@/components/coming-soon"
import { Dashboard } from "@/components/dashboard"
import { AuthProvider } from "@/contexts/auth-context"
import { PostsView } from "@/components/posts-view"

export default function Home() {
  const [activeTab, setActiveTab] = useState("noticias")
  const [showPostsView, setShowPostsView] = useState(false)

  const renderTabContent = () => {
    if (showPostsView && activeTab === "foro-academico") {
      return <PostsView onBack={() => setShowPostsView(false)} />
    }

    switch (activeTab) {
      case "foro-academico":
        return <AcademicForum onViewPosts={() => setShowPostsView(true)} />
      case "metricas":
        return <Dashboard />
      case "noticias":
        return <ComingSoon title="Noticias" />
      case "pronostico":
        return <ComingSoon title="Pronóstico" />
      case "foro":
        return <ComingSoon title="Foro" />
      case "ubicacion":
        return <ComingSoon title="Ubicación" />
      default:
        return <AcademicForum onViewPosts={() => setShowPostsView(true)} />
    }
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-stone-50">
        <Header />

        <main className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-stone-600 mb-6">
            <span>Home</span>
          </nav>

          {/* Species Card */}
          <SpeciesCard />

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="mt-6">{renderTabContent()}</div>
        </main>
      </div>
    </AuthProvider>
  )
}
