import { computed, ref, watch } from 'vue'
import { useDevLocation } from '@/composables/useDevLocation'
import { useDeviceHeading } from '@/composables/useDeviceHeading'
import { bearing, haversine } from '@/lib/geo'

// Zentraler Zugriff auf den Nutzerstandort

const gpsCoords = ref(null) // [lng, lat] | null
const gpsHeading = ref(null) // Grad | null

let watchId = null

const dev = useDevLocation()
const compass = useDeviceHeading()

// Aktueller Standort: Dev-Simulation schlägt echtes GPS.
const coords = computed(() => (dev.enabled.value ? dev.coords.value : gpsCoords.value))

// Blickrichtung: Dev-Joystick > echter Kompass > GPS-Heading.
const rawHeading = computed(() => {
  if (dev.enabled.value) return dev.heading.value
  return compass.heading.value ?? gpsHeading.value
})

const MIN_COURSE_DISTANCE = 10 // m
const movementCourse = ref(null)
let lastCoords = null

watch(coords, (c) => {
  if (!c) return
  if (lastCoords && haversine(lastCoords, c) > MIN_COURSE_DISTANCE) {
    movementCourse.value = bearing(lastCoords, c)
  }
  lastCoords = c
})

const course = computed(() => rawHeading.value ?? movementCourse.value)

// --- GPS-Glättung ----------------------------------------------------------
const MAX_ACCURACY = 50 // m
const MAX_SPEED = 12 // m/s
const SKIP_LIMIT = 5

let smoothed = null // [lng, lat]
let lastFixAt = 0 // ms
let skipped = 0

function filterFix(position) {
  const { longitude, latitude, accuracy } = position.coords
  const raw = [longitude, latitude]
  const now = position.timestamp ?? Date.now()

  if (!smoothed) {
    smoothed = raw
    lastFixAt = now
    return smoothed
  }

  const rescue = skipped >= SKIP_LIMIT

  if (accuracy > MAX_ACCURACY && !rescue) {
    skipped += 1
    return null
  }

  const dist = haversine(smoothed, raw)
  const dt = Math.max((now - lastFixAt) / 1000, 0.001)
  if (dist / dt > MAX_SPEED && !rescue) {
    skipped += 1
    return null
  }

  skipped = 0
  lastFixAt = now

  const alpha = Math.min(1, Math.max(0.05, dist / (dist + Math.max(accuracy, 1))))
  smoothed = [
    smoothed[0] + (raw[0] - smoothed[0]) * alpha,
    smoothed[1] + (raw[1] - smoothed[1]) * alpha,
  ]
  return smoothed
}

function start() {
  if (watchId != null || !('geolocation' in navigator)) return
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const next = filterFix(position)
      if (!next) return // Ausreißer
      gpsCoords.value = next
      gpsHeading.value = position.coords.heading
    },
    (e) => {
      console.warn('Geolocation Error:', e.message)
    },
    // maximumAge: 0
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
  )
}

// Der Watch läuft ab dem ersten Aufruf (App.vue) für die ganze Session.
export function useGeolocation() {
  start()

  return {
    coords, // [lng, lat] | null
    course, // Kurs inkl. Ableitung aus der Bewegung
    requestCompass: compass.requestPermission,
    hasPosition: computed(() => coords.value != null),
  }
}
