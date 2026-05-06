<template>
  <div class="dashboard">
    <header>
      <span>Tågöversikt</span>
      <div>
        <span class="username">{{ auth.user?.username }}</span>
        <button @click="handleLogout">Logga ut</button>
      </div>
    </header>
    <main>
      <p>Inloggad som <strong>{{ auth.user?.username }}</strong></p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard { min-height: 100vh; background: #f5f5f5; font-family: sans-serif; }

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
  font-weight: 600;
}

header div { display: flex; align-items: center; gap: 12px; }

.username { font-size: 13px; color: #777; font-weight: 400; }

header button {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 13px;
}

header button:hover { background: #f5f5f5; }

main { padding: 32px 24px; font-size: 14px; color: #555; }
</style>