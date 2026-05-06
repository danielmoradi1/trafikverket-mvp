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
      <MapView ref="mapRef" :stations="stations" @selectStation="selectStation" />
      

      <div v-if="selectedStation" class="selected-station">
        Vald station: <strong>{{ selectedStation.advertised_name }}</strong>
      </div>

      <div class="toolbar">
        <input v-model="search" type="text" placeholder="Sök station..." />
      </div>
      <AnnouncementPanel :station="selectedStation" />
      <table>
        <thead>
          <tr>
            <th>Station</th>
            <th>Signatur</th>
            <th>Kort namn</th>
            <th>Lat</th>
            <th>Lng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">Laddar...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="5">{{ error }}</td>
          </tr>
          <tr
            v-else
            v-for="s in filteredStations"
            :key="s.id"
            @click="selectStation(s)"
            :class="{ active: selectedStation?.id === s.id }"
          >
            <td>{{ s.advertised_name }}</td>
            <td>{{ s.location_signature }}</td>
            <td>{{ s.short_name }}</td>
            <td>{{ s.lat?.toFixed(4) }}</td>
            <td>{{ s.lng?.toFixed(4) }}</td>
          </tr>
        </tbody>
      </table>
      
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MapView from '../components/MapView.vue'
import AnnouncementPanel from '../components/AnnouncementPanel.vue'
import '../assets/dashboard.css'

const router = useRouter()
const auth = useAuthStore()

interface Station {
  id: number
  advertised_name: string
  location_signature: string
  short_name: string
  lat: number | null
  lng: number | null
}

const stations = ref<Station[]>([])
const selectedStation = ref<Station | null>(null)
const mapRef = ref<InstanceType<typeof MapView> | null>(null)
const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const filteredStations = computed(() =>
  stations.value.filter(s =>
    s.advertised_name.toLowerCase().includes(search.value.toLowerCase()) ||
    s.location_signature.toLowerCase().includes(search.value.toLowerCase())
  )
)

function selectStation(station: Station) {
  selectedStation.value = station
  mapRef.value?.zoomTo(station)
}

async function fetchStations() {
  loading.value = true
  error.value = null
  try {
    const data = await auth.apiFetch<{ stations: Station[] }>('/api/stations')
    stations.value = data.stations
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => fetchStations())
</script>