import { ref } from 'vue'

// Simulierter Standort für GPS-Tests, bedient über DevJoystick.vue.
// Bei `enabled` ignoriert ClimateMap.vue das echte watchPosition.

const SOEST_CENTER = [8.1079, 51.5734]

// Schrittweite eines "vollen" Nudges (~9 m bei Soests Breitengrad, 51.57°N).
const STEP_LAT = 0.00008
const STEP_LNG = 0.00013

const enabled = ref(false)
const coords = ref(null) // [lng, lat] | null
const heading = ref(null) // Grad | null

// headingDeg: 0 = Norden, im Uhrzeigersinn. scale (0..1) skaliert die Schrittweite.
function nudge(headingDeg, scale = 1) {
  if (!enabled.value || !coords.value) return
  const rad = (headingDeg * Math.PI) / 180
  const [lng, lat] = coords.value
  coords.value = [lng + Math.sin(rad) * STEP_LNG * scale, lat + Math.cos(rad) * STEP_LAT * scale]
  heading.value = headingDeg
}

function enable(startCoords = SOEST_CENTER) {
  coords.value = startCoords
  heading.value = null
  enabled.value = true
  console.log('[devLocation] aktiv – Joystick bewegt den simulierten Standort.')
}

function disable() {
  enabled.value = false
  coords.value = null
  heading.value = null
  console.log('[devLocation] deaktiviert – zurück auf echtes GPS.')
}

// Konsole-Zugriff (nur Dev)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.devLocation = { enable, disable }
}

export function useDevLocation() {
  return { enabled, coords, heading, enable, disable, nudge }
}
