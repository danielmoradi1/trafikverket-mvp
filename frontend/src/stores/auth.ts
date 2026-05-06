import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '../types/auth'

const TOKEN_KEY = 'train_app_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  // Hämta token från localstorage vid start, tänekn var att sessionen överlever sidladdning
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Inloggad bara om både token och user finns
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Central fetch-function, bifigar alltid jwt i aut-headern
  // anvädns av alla komponenter som behöver prata med backend
  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(path, { ...options, headers })
    const data = await res.json()
    // kasta fel med backend-msg om req misslyckas
    if (!res.ok) throw new Error((data as { error: string }).error ?? 'Okänt fel')
    return data as T
  }

  // spara token i både state och localstorage
  function persistToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  // rensa sesion - används vid logout 
  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // Logga in - skickar credentials till backend 
  async function login(payload: LoginPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      persistToken(data.token)
      user.value = data.user
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Registrera - skapa nytt konto och loggar in direkt 
  async function register(payload: RegisterPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      persistToken(data.token)
      user.value = data.user
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  // rensa session vid sidladdning 
  async function restoreSession(): Promise<void> {
    if (!token.value) return
    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me')
      user.value = data.user
    } catch {
      clearSession()
    }
  }

  function logout() {
    clearSession()
  }

  return { user, token, loading, error, isAuthenticated, login, register, restoreSession, logout, apiFetch }
})