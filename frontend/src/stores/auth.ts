import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '../types/auth'

const TOKEN_KEY = 'train_app_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(path, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error((data as { error: string }).error ?? 'Okänt fel')
    return data as T
  }

  function persistToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

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