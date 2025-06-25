"use client"

import type React from "react"

import { useState } from "react"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar búsqueda cuando esté disponible la API
    console.log("Búsqueda:", searchQuery)
    // Estructura preparada para: GET /api/search?q=${searchQuery}
  }

  return (
    <header className="bg-white border-b border-stone-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BIO</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-stone-800">BIOML</h1>
              <p className="text-xs text-stone-600">BIODIVERSITY MONITORING</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="text"
                placeholder="Buscar (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-stone-50 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-stone-700 hover:text-emerald-600 transition-colors">
              Home
            </a>
            <a href="#" className="text-stone-700 hover:text-emerald-600 transition-colors">
              About
            </a>
            <a href="#" className="text-stone-700 hover:text-emerald-600 transition-colors">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-stone-50 border-stone-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              </div>
            </form>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-stone-700 hover:text-emerald-600 py-2">
                Home
              </a>
              <a href="#" className="text-stone-700 hover:text-emerald-600 py-2">
                About
              </a>
              <a href="#" className="text-stone-700 hover:text-emerald-600 py-2">
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
