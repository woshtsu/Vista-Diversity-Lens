"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import { validateUser, getUserData, type User } from "@/lib/api"

interface AuthUser extends User {
  email: string // Alias para compatibilidad
  name: string // Alias para compatibilidad
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificar si hay una sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("bioml_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("bioml_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Validar credenciales
      const isValid = await validateUser(email, password)

      if (!isValid) {
        toast({
          title: "❌ Error de autenticación",
          description: "Credenciales incorrectas. Por favor verifica tu email y contraseña.",
          variant: "destructive",
        })
        return false
      }

      // Obtener datos del usuario
      const userData = await getUserData(email)

      if (!userData) {
        toast({
          title: "❌ Error",
          description: "No se pudieron obtener los datos del usuario.",
          variant: "destructive",
        })
        return false
      }

      // Crear objeto de usuario con aliases para compatibilidad
      const authUser: AuthUser = {
        ...userData,
        email: userData.correo,
        name: userData.nombre,
        avatar: undefined, // Puedes agregar lógica para avatar si lo tienes
      }

      setUser(authUser)
      setIsLoggedIn(true)
      localStorage.setItem("bioml_user", JSON.stringify(authUser))

      toast({
        title: "✅ Inicio de sesión exitoso",
        description: `Bienvenido ${userData.nombre}`,
      })

      return true
    } catch (error) {
      console.error("Error durante el login:", error)
      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta más tarde.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("bioml_user")
    toast({
      title: "👋 Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
  }

  return <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
