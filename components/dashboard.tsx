"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Users, MapPin, Eye, Calendar, Activity, Search, Leaf, Mountain } from "lucide-react"
import { Map as PigeonMap, Marker } from "pigeon-maps"
import { getAllPosts, getAllSpecies, type Post, type Species } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface DashboardMetrics {
  totalSightings: number
  totalSpecies: number
  activeUsers: number
  totalLocations: number
  weeklyGrowth: number
  monthlyGrowth: number
}

interface SpeciesData {
  name: string
  count: number
  trend: "up" | "down" | "stable"
  status: "safe" | "vulnerable" | "endangered"
}

interface SightingsByMonth {
  month: string
  sightings: number
  species: number
}

interface TopUser {
  name: string
  email: string
  avatar?: string
  sightings: number
  species: number
}

interface RecentSighting {
  id: string
  species: string
  location: string
  user: string
  time: string
  coordinates: [number, number]
}

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#dc2626", "#ea580c", "#ca8a04"]

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSightings: 0,
    totalSpecies: 0,
    activeUsers: 0,
    totalLocations: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [timeRange, selectedRegion])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [postsData, speciesData] = await Promise.all([getAllPosts(), getAllSpecies()])

      setPosts(postsData)
      setSpecies(speciesData)

      // Calcular métricas basadas en datos reales
      const uniqueUsers = new Set(postsData.map((post) => post.userEmail)).size
      const uniqueLocations = new Set(postsData.map((post) => `${post.location.latitude},${post.location.longitude}`))
        .size

      setMetrics({
        totalSightings: postsData.length,
        totalSpecies: speciesData.length,
        activeUsers: uniqueUsers,
        totalLocations: uniqueLocations,
        weeklyGrowth: 12.5, // Esto se podría calcular comparando con datos anteriores
        monthlyGrowth: 8.3,
      })
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Procesar datos para gráficos
  const getSpeciesData = (): SpeciesData[] => {
    const speciesCount = new Map<string, number>()

    posts.forEach((post) => {
      const commonName = species.find((s) => s.nombre_cientifico === post.species)?.nombre_comun || post.species
      speciesCount.set(commonName, (speciesCount.get(commonName) || 0) + 1)
    })

    return Array.from(speciesCount.entries())
      .map(([name, count]) => ({
        name,
        count,
        trend: "up" as const, // Se podría calcular comparando con períodos anteriores
        status: "safe" as const, // Se podría obtener de una base de datos de conservación
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  const getSightingsByMonth = (): SightingsByMonth[] => {
    const monthlyData = new Map<string, { sightings: number; speciesSet: Set<string> }>()

    posts.forEach((post) => {
      const date = new Date(post.createdAt)
      const monthKey = date.toLocaleDateString("es-ES", { month: "short" })

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { sightings: 0, speciesSet: new Set() })
      }

      const data = monthlyData.get(monthKey)!
      data.sightings++
      data.speciesSet.add(post.species)
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      sightings: data.sightings,
      species: data.speciesSet.size,
    }))
  }

  const getTopUsers = (): TopUser[] => {
    const userStats = new Map<string, { name: string; sightings: number; speciesSet: Set<string> }>()

    posts.forEach((post) => {
      if (!userStats.has(post.userEmail)) {
        userStats.set(post.userEmail, {
          name: post.userName,
          sightings: 0,
          speciesSet: new Set(),
        })
      }

      const stats = userStats.get(post.userEmail)!
      stats.sightings++
      stats.speciesSet.add(post.species)
    })

    return Array.from(userStats.entries())
      .map(([email, stats]) => ({
        name: stats.name,
        email,
        sightings: stats.sightings,
        species: stats.speciesSet.size,
      }))
      .sort((a, b) => b.sightings - a.sightings)
      .slice(0, 4)
  }

  const getRecentSightings = (): RecentSighting[] => {
    return posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((post) => {
        const commonName = species.find((s) => s.nombre_cientifico === post.species)?.nombre_comun || post.species
        const timeAgo = getTimeAgo(post.createdAt)

        return {
          id: post.id,
          species: commonName,
          location: `${post.location.latitude.toFixed(3)}, ${post.location.longitude.toFixed(3)}`,
          user: post.userName,
          time: timeAgo,
          coordinates: [post.location.latitude, post.location.longitude] as [number, number],
        }
      })
  }

  const getTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace menos de 1 hora"
    if (diffInHours < 24) return `Hace ${diffInHours} horas`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} días`
  }

  const speciesData = getSpeciesData()
  const sightingsByMonth = getSightingsByMonth()
  const topUsers = getTopUsers()
  const recentSightings = getRecentSightings()

  const pieData = speciesData.map((species, index) => ({
    name: species.name,
    value: species.count,
    color: COLORS[index % COLORS.length],
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "vulnerable":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "endangered":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-stone-100 text-stone-700 border-stone-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-emerald-600" />
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
      default:
        return <Activity className="w-3 h-3 text-stone-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600">⟳</div>
          <p className="text-stone-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard de Biodiversidad</h1>
          <p className="text-stone-600">Monitoreo y análisis de avistamientos de fauna</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las regiones</SelectItem>
              <SelectItem value="junin">Junín</SelectItem>
              <SelectItem value="huancavelica">Huancavelica</SelectItem>
              <SelectItem value="ayacucho">Ayacucho</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Total Avistamientos</CardTitle>
            <Search className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{metrics.totalSightings.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />+{metrics.weeklyGrowth}% esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Especies Registradas</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{metrics.totalSpecies}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />+{metrics.monthlyGrowth}% este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{metrics.activeUsers}</div>
            <p className="text-xs text-stone-500 mt-1">En los últimos 30 días</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Ubicaciones</CardTitle>
            <Mountain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{metrics.totalLocations}</div>
            <p className="text-xs text-stone-500 mt-1">Zonas monitoreadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avistamientos por mes */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800">Tendencia de Avistamientos</CardTitle>
          </CardHeader>
          <CardContent>
            {sightingsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sightingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="month" stroke="#78716c" />
                  <YAxis stroke="#78716c" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e7e5e4",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sightings"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="species"
                    stroke="#0891b2"
                    fill="#0891b2"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-stone-500">
                No hay datos suficientes para mostrar la tendencia
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribución por especies */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800">Distribución por Especies</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-stone-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-stone-500">
                No hay datos de especies para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Especies más avistadas */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Especies Más Avistadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {speciesData.length > 0 ? (
              speciesData.map((species, index) => (
                <div key={species.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{species.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(species.status)}>
                          {species.status === "safe" && "Segura"}
                          {species.status === "vulnerable" && "Vulnerable"}
                          {species.status === "endangered" && "En Peligro"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-stone-800">{species.count}</span>
                      {getTrendIcon(species.trend)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-center py-4">No hay datos de especies disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Usuarios más activos */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuarios Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <div key={user.email} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                    {index + 1}
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.sightings} avistamientos</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.species} especies
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-center py-4">No hay usuarios activos disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Avistamientos recientes */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Avistamientos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSightings.length > 0 ? (
              recentSightings.map((sighting) => (
                <div key={sighting.id} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{sighting.species}</p>
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <MapPin className="w-3 h-3" />
                        {sighting.location}
                      </div>
                    </div>
                    <span className="text-xs text-stone-500">{sighting.time}</span>
                  </div>
                  <p className="text-xs text-stone-600">Por {sighting.user}</p>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-center py-4">No hay avistamientos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mapa de avistamientos */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="text-stone-800 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa de Avistamientos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg overflow-hidden border border-stone-200">
            <PigeonMap
              center={recentSightings.length > 0 ? recentSightings[0].coordinates : [50.879, 4.6997]}
              zoom={8}
              attribution={false}
            >
              {recentSightings.map((sighting) => (
                <Marker
                  key={sighting.id}
                  width={40}
                  anchor={sighting.coordinates}
                  color="#059669"
                  onClick={() => console.log(`Clicked on ${sighting.species} sighting`)}
                />
              ))}
            </PigeonMap>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-stone-600">
            <span>Últimos avistamientos en tiempo real</span>
            <Button variant="outline" size="sm" className="text-xs">
              Ver mapa completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
