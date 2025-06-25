// Configuración y funciones para la API
const API_BASE_URL = "http://localhost:1234/api"

export interface User {
  usuario_id: number
  nombre: string
  correo: string
  titulo_biologico?: string
}

export interface Species {
  especie_id: number
  nombre_cientifico: string
  nombre_comun: string
  familia: string
}

export interface Post {
  id: string
  content: string
  userEmail: string
  userName: string
  location: {
    latitude: number
    longitude: number
  }
  species: string
  createdAt: string
  likes: number
  comments: number
}

export interface CreatePostData {
  usuario_id: number
  especie_id: number
  descripcion: string
  latitude: number
  longitude: number
}

// Función para validar usuario
export async function validateUser(correo: string, contraseña: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/validar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contraseña }),
    })

    if (!response.ok) {
      throw new Error("Error en la validación")
    }

    const data = await response.json()
    return data.esUsuario === true
  } catch (error) {
    console.error("Error validando usuario:", error)
    return false
  }
}

// Función para obtener datos del usuario
export async function getUserData(correo: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/getuserdata/${encodeURIComponent(correo)}`)

    if (!response.ok) {
      throw new Error("Error obteniendo datos del usuario")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error)
    return null
  }
}

// Función para obtener todas las especies
export async function getAllSpecies(): Promise<Species[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllspecies`)

    if (!response.ok) {
      throw new Error("Error obteniendo especies")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error obteniendo especies:", error)
    return []
  }
}

// Función para obtener todos los posts
export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllPosts`)

    if (!response.ok) {
      throw new Error("Error obteniendo posts")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error obteniendo posts:", error)
    return []
  }
}

// Función para crear un nuevo post
export async function createPost(postData: CreatePostData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      throw new Error("Error creando post")
    }

    const data = await response.json()
    return data.isCreated === true
  } catch (error) {
    console.error("Error creando post:", error)
    return false
  }
}
