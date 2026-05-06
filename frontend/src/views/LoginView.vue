<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Tågöversikt</h1>

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

const router = useRouter()
const auth = useAuthStore()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')
const form = reactive({ username: '', email: '', password: '' })
const fieldErrors = reactive<Record<string, string>>({ username: '', email: '', password: '' })

function switchMode(m: Mode) {
  mode.value = m
  auth.error = null
  Object.keys(fieldErrors).forEach(k => (fieldErrors[k] = ''))
}

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

async function handleSubmit() {
  if (!validateAll()) return
  try {
    if (mode.value === 'login') await auth.login({ username: form.username, password: form.password })
    else await auth.register({ username: form.username, email: form.email, password: form.password })
    router.push('/dashboard')
  } catch { }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.auth-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 32px;
  width: 100%;
  max-width: 360px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: #111;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tabs button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.tabs button.active {
  background: #111;
  color: white;
  border-color: #111;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

label {
  font-size: 13px;
  color: #555;
}

input {
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  width: 100%;
}

input:focus {
  border-color: #111;
}

.error {
  font-size: 12px;
  color: #e00;
}

.api-error {
  background: #fff0f0;
  border: 1px solid #fcc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: #c00;
  margin-bottom: 16px;
}

form > button[type='submit'] {
  width: 100%;
  padding: 10px;
  background: #111;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

form > button[type='submit']:hover {
  background: #333;
}

form > button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>