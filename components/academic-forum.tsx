"use client"

import { useState, useEffect } from "react"
import { Map, Marker } from "pigeon-maps"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Send, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { toast } from "@/hooks/use-toast"
import { getAllSpecies, createPost, type Species } from "@/lib/api"

interface AcademicForumProps {
  onViewPosts?: () => void
}

export function AcademicForum({ onViewPosts }: AcademicForumProps) {
  const { user, isLoggedIn } = useAuth()
  const [comment, setComment] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState<string>("")
  const [species, setSpecies] = useState<Species[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadSpecies()
  }, [])

  const loadSpecies = async () => {
    try {
      const speciesData = await getAllSpecies()
      setSpecies(speciesData)
    } catch (error) {
      console.error("Error cargando especies:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar las especies",
        variant: "destructive",
      })
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          toast({
            title: "✅ Ubicación obtenida",
            description: "Tu ubicación actual ha sido establecida en el mapa",
          })
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          toast({
            title: "❌ Error",
            description: "No se pudo obtener tu ubicación",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "❌ Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "❌ Error",
        description: "Por favor escribe un comentario",
        variant: "destructive",
      })
      return
    }

    if (!selectedSpecies) {
      toast({
        title: "❌ Error",
        description: "Por favor selecciona una especie",
        variant: "destructive",
      })
      return
    }

    if (!userLocation) {
      toast({
        title: "❌ Error",
        description: "Por favor obtén tu ubicación primero",
        variant: "destructive",
      })
      return
    }

    if (!isLoggedIn || !user) {
      setShowLoginModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const postData = {
        usuario_id: user.usuario_id,
        especie_id: Number.parseInt(selectedSpecies),
        descripcion: comment,
        latitude: userLocation[0],
        longitude: userLocation[1],
      }

      const success = await createPost(postData)

      if (success) {
        setComment("")
        setSelectedSpecies("")
        toast({
          title: "✅ Comentario enviado",
          description: "Tu avistamiento ha sido registrado exitosamente",
        })
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo enviar el comentario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error enviando comentario:", error)
      toast({
        title: "❌ Error",
        description: "Error al enviar el comentario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewPosts = () => {
    if (onViewPosts) {
      onViewPosts()
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-600 bg-blue-50 px-4 py-2 rounded">
        <span>Home</span> <span className="mx-2">{">"}</span>
        <span>Foro Académico</span> <span className="mx-2">{">"}</span>
        <span>Posts</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Authentication & Map */}
        <div className="space-y-4">
          {/* Authentication Section */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
            {isLoggedIn && user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar || "https://i.pravatar.cc/60"} alt={user.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-stone-800">{user.name}</p>
                  <p className="text-sm text-stone-600">{user.email}</p>
                  {user.titulo_biologico && <p className="text-xs text-emerald-600">{user.titulo_biologico}</p>}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  onClick={() => setShowLoginModal(true)}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          {/* Location Button */}
          <Button onClick={handleGetLocation} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Usar mi ubicación actual
          </Button>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
            <div className="h-64">
              <Map center={userLocation || [-12.0464, -77.0428]} zoom={userLocation ? 13 : 8} attribution={false}>
                {userLocation && <Marker width={50} anchor={userLocation} color="#059669" />}
              </Map>
            </div>
            <div className="p-2 bg-stone-50 text-xs text-stone-600 text-center">
              Pigeon | © OpenStreetMap contributors
            </div>
          </div>
        </div>

        {/* Right Column - Comment Form */}
        <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">Descripción del Avistamiento</h3>
              <Textarea
                placeholder="Describe tu avistamiento de fauna aquí... Por ejemplo: Avistamiento de Vicuña observada al atardecer cerca del lago"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-32 bg-white border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">Seleccionar Especie</h3>
              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger className="bg-white border-stone-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Selecciona la especie avistada" />
                </SelectTrigger>
                <SelectContent>
                  {species.map((especie) => (
                    <SelectItem key={especie.especie_id} value={especie.especie_id.toString()}>
                      <div>
                        <div className="font-medium">{especie.nombre_comun}</div>
                        <div className="text-sm text-stone-500">{especie.nombre_cientifico}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSubmitComment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Comentario"}
              </Button>
              <Button
                onClick={handleViewPosts}
                variant="outline"
                className="bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Posts
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
