// typ definitions for authentication related data structures
// Allows ts to warn if we sent wrong data to the api
// just for user 
export interface User {
  id: number
  username: string
  email: string
  created_at?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}