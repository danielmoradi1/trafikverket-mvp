<template>
  <!-- Visar bara panelen om en station är vald -->
  <div class="announcement-panel" v-if="station">
    <div class="panel-header">
      <h2>{{ station.advertised_name }}</h2>
      <!-- Växla mellan avgångar och ankomster -->
      <div class="tabs">
      <button :class="{ active: type === 'arrival' }" @click="setType('arrival')">Ankomster</button>
      <button :class="{ active: type === 'departure' }" @click="setType('departure')">Avgångar</button>
      </div>
    </div>

    <div v-if="loading" class="state">Laddar...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="announcements.length === 0" class="state">Inga tåg hittades</div>

    <table v-else>
      <thead>
        <tr>
          <th>Tåg</th>
          <th>Tid</th>
          <th>Beräknad</th>
          <th>Spår</th>
          <th>Till/Från</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in announcements" :key="a.AdvertisedTrainIdent + a.AdvertisedTimeAtLocation">
          <td>{{ a.AdvertisedTrainIdent }}</td>
          <td>{{ formatTime(a.AdvertisedTimeAtLocation) }}</td>
          <td>{{ a.EstimatedTimeAtLocation ? formatTime(a.EstimatedTimeAtLocation) : '—' }}</td>
          <td>{{ a.TrackAtLocation ?? '—' }}</td>
          <td>{{ getDestination(a) }}</td>
          <td :class="{ canceled: a.Canceled }">{{ a.Canceled ? 'Inställd' : 'Ok' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import '../assets/AnnouncementPanel.css'

interface Station {
  id: number
  advertised_name: string
  location_signature: string
}

interface Announcement {
  AdvertisedTrainIdent: string
  AdvertisedTimeAtLocation: string
  EstimatedTimeAtLocation: string | null
  TrackAtLocation: string | null
  ToLocation: { LocationName: string }[] | null
  FromLocation: { LocationName: string }[] | null
  ActivityType: string
  Canceled: boolean
}

const props = defineProps<{ station: Station | null }>()
const auth = useAuthStore()

const announcements = ref<Announcement[]>([])
const type = ref<'departure' | 'arrival'>('departure')
const loading = ref(false)
const error = ref<string | null>(null)

  // Hämta annonser för vald station
async function fetchAnnouncements() {
  if (!props.station) return
  loading.value = true
  error.value = null
  try {
    const data = await auth.apiFetch<{ announcements: Announcement[] }>(
      `/api/announcements/${props.station.location_signature}?type=${type.value}`
    )
    announcements.value = data.announcements
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

// Byt typ och hämta ny data
function setType(t: 'departure' | 'arrival') {
  type.value = t
  fetchAnnouncements()
}
// Formatera ISO-tid till HH:MM
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

// Visa destination
function getDestination(a: Announcement): string {
  if (a.ActivityType === 'Avgang' && a.ToLocation?.length) {
    return a.ToLocation[0].LocationName
  }
  if (a.ActivityType === 'Ankomst' && a.FromLocation?.length) {
    return a.FromLocation[0].LocationName
  }
  return '—'
}

watch(() => props.station, () => {
  fetchAnnouncements()
})
</script>