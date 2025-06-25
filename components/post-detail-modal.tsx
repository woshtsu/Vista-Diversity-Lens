"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Heart, MessageCircle, Send } from "lucide-react"
import { Map, Marker } from "pigeon-maps"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import type { Post, Species } from "@/lib/api"

interface Comment {
  id: string
  content: string
  userEmail: string
  userName: string
  userAvatar?: string
  createdAt: string
}

interface PostDetailModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  species: Species[]
}

export function PostDetailModal({ post, isOpen, onClose, species }: PostDetailModalProps) {
  const { user, isLoggedIn } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likes || 0)

  if (!post) return null

  const getSpeciesCommonName = (scientificName: string) => {
    const especie = species.find((s) => s.nombre_cientifico === scientificName)
    return especie?.nombre_comun || scientificName
  }

  const handleLike = () => {
    if (!isLoggedIn) {
      toast({
        title: "❌ Error",
        description: "Debes iniciar sesión para dar like",
        variant: "destructive",
      })
      return
    }

    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    // TODO: Implementar API call para like/unlike cuando esté disponible
    toast({
      title: isLiked ? "💔 Like removido" : "❤️ Like agregado",
      description: isLiked ? "Has removido tu like" : "Has dado like a este post",
    })
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "❌ Error",
        description: "Por favor escribe un comentario",
        variant: "destructive",
      })
      return
    }

    if (!isLoggedIn || !user) {
      toast({
        title: "❌ Error",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      })
      return
    }

    // TODO: Implementar API call para crear comentario cuando esté disponible
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      content: newComment,
      userEmail: user.email,
      userName: user.name,
      userAvatar: user.avatar,
      createdAt: new Date().toISOString(),
    }

    setComments((prev) => [...prev, newCommentObj])
    setNewComment("")

    toast({
      title: "✅ Comentario agregado",
      description: "Tu comentario ha sido publicado",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-800">Detalle del Avistamiento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.userAvatar || "/placeholder.svg"} alt={post.userName} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">{post.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-stone-800">{post.userName}</p>
                <p className="text-sm text-stone-600">{post.userEmail}</p>
                <div className="flex items-center text-sm text-stone-500 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            {post.species && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {getSpeciesCommonName(post.species)}
              </Badge>
            )}
          </div>

          {/* Post Content */}
          <div className="bg-stone-50 rounded-lg p-4">
            <p className="text-stone-700 leading-relaxed">{post.content}</p>
          </div>

          {/* Location & Map */}
          {post.location && (
            <div className="space-y-3">
              <div className="flex items-center text-stone-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  Coordenadas: {post.location.latitude.toFixed(6)}, {post.location.longitude.toFixed(6)}
                </span>
              </div>
              <div className="h-48 rounded-lg overflow-hidden border border-stone-200">
                <Map center={[post.location.latitude, post.location.longitude]} zoom={13} attribution={false}>
                  <Marker width={50} anchor={[post.location.latitude, post.location.longitude]} color="#059669" />
                </Map>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 py-3 border-y border-stone-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? "text-red-600" : "text-stone-600"} hover:text-red-600`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {likesCount} Me gusta
            </Button>
            <div className="flex items-center text-stone-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              {comments.length} Comentarios
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Comentarios</h3>

            {/* Add Comment */}
            {isLoggedIn ? (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-20 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button onClick={handleSubmitComment} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="w-3 h-3 mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-stone-50 rounded-lg">
                <p className="text-stone-600">Inicia sesión para comentar</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-stone-500 text-center py-4">No hay comentarios aún</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 bg-stone-50 rounded-lg p-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm text-stone-800">{comment.userName}</p>
                        <p className="text-xs text-stone-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      <p className="text-stone-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
