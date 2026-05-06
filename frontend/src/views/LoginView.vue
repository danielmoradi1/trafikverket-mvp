<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Tågöversikt</h1>

      <!-- tabbar mellan login och reg -->
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">Logga in</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">Registrera</button>
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div v-if="mode === 'register'" class="field">
          <label for="email">E-post</label>
          <input id="email" v-model="form.email" type="email" placeholder="namn@bolag.se" />
          <span v-if="fieldErrors.email" class="error">{{ fieldErrors.email }}</span>
        </div>

        <div class="field">
          <label for="username">Användarnamn</label>
          <input id="username" v-model="form.username" type="text" placeholder="operatör01" />
          <span v-if="fieldErrors.username" class="error">{{ fieldErrors.username }}</span>
        </div>

        <div class="field">
          <label for="password">Lösenord</label>
          <input id="password" v-model="form.password" type="password" placeholder="••••••••" />
          <span v-if="fieldErrors.password" class="error">{{ fieldErrors.password }}</span>
        </div>

        <!-- fel-meddelande från backend -->
        <div v-if="auth.error" class="api-error">{{ auth.error }}</div>

        <button type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Laddar...' : mode === 'login' ? 'Logga in' : 'Skapa konto' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import '../assets/login.css'

const router = useRouter()
const auth = useAuthStore()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')
const form = reactive({ username: '', email: '', password: '' })
const fieldErrors = reactive<Record<string, string>>({ username: '', email: '', password: '' })

// byt mellan login och registering
function switchMode(m: Mode) {
  mode.value = m
  auth.error = null
  Object.keys(fieldErrors).forEach(k => (fieldErrors[k] = ''))
}

// Validerar formuläret innan submit
function validateAll(): boolean {
  let valid = true
  Object.keys(fieldErrors).forEach(k => (fieldErrors[k] = ''))

  if (!form.username.trim()) { fieldErrors.username = 'Krävs'; valid = false }
  if (mode.value === 'register') {
    if (!form.email.trim()) { fieldErrors.email = 'Krävs'; valid = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { fieldErrors.email = 'Ogiltig e-post'; valid = false }
  }
  if (!form.password) { fieldErrors.password = 'Krävs'; valid = false }
  else if (mode.value === 'register' && form.password.length < 6) { fieldErrors.password = 'Minst 6 tecken'; valid = false }
  return valid
}

// skicka formuläret - logga in eller registrera broende på läge
async function handleSubmit() {
  if (!validateAll()) return
  try {
    if (mode.value === 'login') await auth.login({ username: form.username, password: form.password })
    else await auth.register({ username: form.username, email: form.email, password: form.password })
    router.push('/dashboard')
  } catch { }
}
</script>