"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Filter, MapPin, Calendar, Heart, MessageCircle, Loader2 } from "lucide-react"
import { PostDetailModal } from "@/components/post-detail-modal"
import { toast } from "@/hooks/use-toast"
import { getAllPosts, getAllSpecies, type Post, type Species } from "@/lib/api"

interface PostsViewProps {
  onBack: () => void
}

export function PostsView({ onBack }: PostsViewProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, selectedSpecies, sortBy])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postsData, speciesData] = await Promise.all([getAllPosts(), getAllSpecies()])

      setPosts(postsData)
      setSpecies(speciesData)
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.species.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtrar por especie
    if (selectedSpecies !== "all") {
      filtered = filtered.filter((post) => post.species === selectedSpecies)
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "popular":
          return (b.likes || 0) - (a.likes || 0)
        default:
          return 0
      }
    })

    setFilteredPosts(filtered)
  }

  const getSpeciesCommonName = (scientificName: string) => {
    const especie = species.find((s) => s.nombre_cientifico === scientificName)
    return especie?.nombre_comun || scientificName
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePostClick = (post: Post) => {
    setSelectedPost(post)
    setShowPostDetail(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-stone-600">Cargando posts del foro académico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-stone-600 hover:text-stone-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Foro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Posts del Foro Académico</h1>
            <p className="text-stone-600">{filteredPosts.length} avistamientos encontrados</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-stone-600 bg-blue-50 px-4 py-2 rounded">
        <span>Home</span> <span className="mx-2">{">"}</span>
        <span>Foro Académico</span> <span className="mx-2">{">"}</span>
        <span className="font-medium">Todos los Posts</span>
      </nav>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Species Filter */}
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger className="border-stone-200 focus:border-emerald-500 focus:ring-emerald-500">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por especie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las especies</SelectItem>
              {species.map((especie) => (
                <SelectItem key={especie.especie_id} value={especie.nombre_cientifico}>
                  {especie.nombre_comun}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-stone-200 focus:border-emerald-500 focus:ring-emerald-500">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedSpecies("all")
              setSortBy("recent")
            }}
            className="border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-stone-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">No se encontraron posts</h3>
          <p className="text-stone-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-stone-200 hover:border-emerald-300"
              onClick={() => handlePostClick(post)}
            >
              <CardContent className="p-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder.svg" alt={post.userName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {post.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 truncate">{post.userName}</p>
                    <div className="flex items-center text-sm text-stone-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    {getSpeciesCommonName(post.species)}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-stone-700 text-sm mb-3 line-clamp-3">{post.content}</p>

                {/* Location */}
                <div className="flex items-center text-sm text-stone-500 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">
                    {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-stone-500">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center text-stone-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">{post.comments || 0}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    Ver detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        species={species}
      />
    </div>
  )
}
