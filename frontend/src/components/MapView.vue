<template>
  <div id="map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../assets/map.css'

interface Station {
  id: number
  advertised_name: string
  location_signature: string
  lat: number | null
  lng: number | null
}

const props = defineProps<{ stations: Station[] }>()
const emit = defineEmits<{ (e: 'selectStation', station: Station): void }>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null


// fixar Leaflets default marker-ikoner som inte fungerar med Vite, fick hjälp av AI
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


// Lägg till markers för alla stationer -rensa gamla markers först
function addMarkers(stations: Station[]) {
  if (!map) return
  markersLayer?.clearLayers()
  markersLayer = L.layerGroup().addTo(map)

  stations.forEach(station => {
    if (!station.lat || !station.lng) return
    L.marker([station.lat, station.lng])
      .addTo(markersLayer!)
      .bindPopup(`<b>${station.advertised_name}</b><br>${station.location_signature}`)
      .on('click', () => emit('selectStation', station))
  })
}

onMounted(() => {
  if (!mapContainer.value) return

  // Initiera kartan centrerad över Sverige
  map = L.map(mapContainer.value).setView([62.0, 15.0], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  if (props.stations.length > 0) addMarkers(props.stations)
})

watch(() => props.stations, (stations) => {
  addMarkers(stations)
})

onUnmounted(() => {
  map?.remove()
})

// Zooma kartan till en specifik station och öppna popup
function zoomTo(station: Station) {
  if (!map || !station.lat || !station.lng) return
  map.setView([station.lat, station.lng], 12)

  markersLayer?.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      const pos = layer.getLatLng()
      if (pos.lat === station.lat && pos.lng === station.lng) {
        layer.openPopup()
      }
    }
  })
}

defineExpose({ zoomTo })
</script>