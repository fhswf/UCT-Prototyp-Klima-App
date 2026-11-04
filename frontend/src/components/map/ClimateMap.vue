<script setup>
import { ref, computed, onActivated, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import SearchResult from '@/components/ui/SearchResult.vue'
import MapLegend from '@/components/map/MapLegend.vue'
import WarningsOverlay from '@/components/map/WarningsOverlay.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useRouter } from 'vue-router'
import { useWarnings } from '@/composables/useWarnings'
import { useGeolocation } from '@/composables/useGeolocation'
import { useMapLayers } from '@/composables/useMapLayers'
import { sliceFrom } from '@/lib/geo'
import { walkColor } from '@/icons'
import { basemap } from '@/data/basemap'

const props = defineProps({
  center: { type: Array, default: () => [8.1079, 51.5734] }, // Soest
  zoom: { type: Number, default: 13 },
  locations: { type: Array, default: () => [] }, // [{ id, name, location: GeoJSON Point }]
  pois: { type: Object, default: null }, // optional: FeatureCollection (Punkte, Marker)
  routes: { type: Object, default: null }, // optional: FeatureCollection (Linien, für Walk-Views)
  search: { type: Boolean, default: false }, // Suchleiste anzeigen (nur KartenView)
  nav: { type: Boolean, default: false }, // Navigationsmodus: Controls (Kompass/Klima/Warnung) ohne Suchleiste
  activeId: { type: [Number, String], default: null }, // aktueller Standort -> roter, größerer Marker
  arrivedId: { type: [Number, String], default: null }, // erreichter Standort -> Karte über dem Marker
  focus: { type: String, default: 'none' },
  routeColor: { type: String, default: '' },
})
const emit = defineEmits([
  'location-click',
  'poi-click',
  'open-climate',
  'user-location',
  'bearing',
  'arrival-click',
  'arrival-close',
])

const router = useRouter()

const { warnings, loadWarnings } = useWarnings()

// Suche: filtert die übergebenen locations nach Name
const query = ref('')
const searchResults = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return props.locations.filter((l) => l.name?.toLowerCase().includes(q)).slice(0, 6)
})

// Sichtbarkeit der Layer (Legende ist die Bedienoberfläche dazu).
const { visible: layerVisible, isVisible, isPoiVisible, hiddenPoiTypes } = useMapLayers()

const mapEl = ref(null)
let map = null
let markers = [] // [{ key, marker }] – nummerierte Standorte
let poiMarkers = [] // [{ key, marker }] – Punkt-POIs
let styleReady = false

// Quellenvermerk der Karte
const MAP_ATTRIBUTION =
  '© GeoBasis-DE / <a href="https://www.bkg.bund.de" target="_blank" rel="noopener noreferrer">BKG</a> (2026) ' +
  '<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>'

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const resolveColor = (c) => (c && c.startsWith('var(') ? cssVar(c.slice(4, -1).trim()) : c)
const routeLineColor = () => resolveColor(props.routeColor) || cssVar('--c-primary')

const poiIconUrls = Object.fromEntries(
  Object.entries(
    import.meta.glob('@/assets/icons/poi-*.svg', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
)

// nummerierte Standort-Marker
function drawMarkers() {
  if (!map) return
  markers.forEach(({ marker }) => marker.remove())
  markers = []
  for (const loc of props.locations) {
    const coords = loc.location?.coordinates
    if (!coords) continue
    // Aktueller Standort: rot + größer. Andere Standorte: blau + etwas kleiner.
    const active = props.activeId != null && String(loc.id) === String(props.activeId)
    const size = active ? 32 : 22
    const bg = active ? cssVar('--c-accent') : cssVar('--c-primary')
    const el = document.createElement('div')
    el.textContent = loc.id
    el.style.cssText =
      `width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;` +
      `display:flex;align-items:center;justify-content:center;font-size:${active ? 14 : 12}px;` +
      'font-weight:700;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);cursor:pointer; z-index:1;' +
      (active ? 'z-index:3;' : '')
    el.addEventListener('click', () => emit('location-click', loc))

    // Hover-Nametag mit Ortsnamen
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 16,
      zIndex: 2,
    }).setText(loc.name)
    el.addEventListener('mouseenter', () => popup.setLngLat(coords).addTo(map))
    el.addEventListener('mouseleave', () => popup.remove())

    markers.push({
      key: 'walk-location',
      marker: new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map),
    })
  }
  applyLayerVisibility()
}

// Ankunfts-Karte: schwebt über dem erreichten Standort
let arrivalPopup = null

function removeArrival() {
  arrivalPopup?.remove()
  arrivalPopup = null
}

function drawArrival() {
  if (!map) return
  removeArrival()

  const loc = props.locations.find((l) => String(l.id) === String(props.arrivedId))
  const coords = loc?.location?.coordinates
  if (!coords) return

  const card = document.createElement('div')
  card.className = 'arrival-card'
  card.innerHTML =
    '<span class="arrival-num"></span>' +
    '<span class="arrival-body">' +
    '<span class="arrival-kicker">Standort erreicht</span>' +
    '<span class="arrival-name"></span>' +
    '</span>' +
    '<span class="material-symbols-outlined arrival-go">chevron_right</span>'
  card.querySelector('.arrival-num').textContent = loc.id
  card.querySelector('.arrival-name').textContent = loc.name ?? ''
  card.addEventListener('click', () => emit('arrival-click', loc))

  arrivalPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    offset: 26,
    className: 'arrival-popup',
    maxWidth: '260px',
  })
    .setLngLat(coords)
    .setDOMContent(card)
    .addTo(map)

  arrivalPopup.on('close', () => emit('arrival-close'))
}

// Routen einfärben nach Kategorie
function colorizeRoutes(fc) {
  if (!fc?.features?.length) return fc
  return {
    ...fc,
    features: fc.features.map((f) => {
      const p = f.properties ?? {}
      if (!p.category && !p.name) return f
      return { ...f, properties: { ...p, color: resolveColor(walkColor(p)) } }
    }),
  }
}

// Datengesteuerte Linienfarbe: Feature-Farbe, sonst routeColor-Prop/Markenblau.
const routeColorExpr = () => ['coalesce', ['get', 'color'], routeLineColor()]

// optionale Routenlinien (für Walk-Views)
function drawRoutes() {
  if (!map || !props.routes || !styleReady) return
  const data = colorizeRoutes(props.routes)
  const existing = map.getSource('routes')
  if (existing) {
    existing.setData(data)
    return
  }
  map.addSource('routes', { type: 'geojson', data })

  if (!props.nav) {
    map.addLayer({
      id: 'routes-casing',
      type: 'line',
      source: 'routes',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': cssVar('--c-white'), 'line-width': 9, 'line-opacity': 0.9 },
    })
  }

  map.addLayer({
    id: 'routes-line',
    type: 'line',
    source: 'routes',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    // In der Navigation: gedämpfte Gesamtroute, darüber die helle Reststrecke.
    paint: {
      'line-color': props.nav ? cssVar('--c-border-strong') : routeColorExpr(),
      'line-width': props.nav ? 8 : 5,
    },
  })
  applyLayerVisibility()
}

// Erste LineString-Geometrie aus einem FeatureCollection ziehen.
function firstLine(fc) {
  const g = fc?.features?.find((f) => f.geometry?.type === 'LineString')?.geometry
  return g?.coordinates ?? null
}

// Reststrecke ab User-Position hell über der gedämpften Route. Nur im Nav-Modus.
function updateRemaining(coords) {
  if (!map || !props.nav || !styleReady) return
  const line = firstLine(props.routes)
  if (!line) return
  const data = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: sliceFrom(line, coords) },
    properties: {},
  }
  const src = map.getSource('route-remaining')
  if (src) {
    src.setData(data)
    return
  }
  map.addSource('route-remaining', { type: 'geojson', data })
  map.addLayer({
    id: 'route-remaining-line',
    type: 'line',
    source: 'route-remaining',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': routeLineColor(), 'line-width': 6 },
  })
  applyLayerVisibility()
}

// Auto-Ausschnitt je nach focus-Prop (nicht im Nav-Modus – da folgt die Kamera).
function fitContent() {
  if (!map || props.nav || props.focus === 'none') return

  if (props.focus === 'route') {
    // Routenlinie, sonst die Standorte der Route (nicht jede Route hat route_points).
    const line = firstLine(props.routes)
    const pts = line?.length
      ? line
      : props.locations.map((l) => l.location?.coordinates).filter(Boolean)
    if (pts.length) {
      const b = new maplibregl.LngLatBounds(pts[0], pts[0])
      for (const c of pts) b.extend(c)
      map.fitBounds(b, { padding: 40, maxZoom: 16, duration: 600 })
      return
    }
  }

  if (props.focus === 'location') {
    const active = props.locations.find((l) => String(l.id) === String(props.activeId))
    const coords = active?.location?.coordinates ?? props.locations[0]?.location?.coordinates
    if (coords) map.easeTo({ center: coords, zoom: 15, duration: 600 })
  }
}

// Flächen-POIs (Coole-Orte-Bereiche)
function drawPoiAreas() {
  if (!map || !props.pois || !styleReady) return
  const data = {
    type: 'FeatureCollection',
    features: (props.pois.features ?? []).filter((f) =>
      ['Polygon', 'MultiPolygon'].includes(f.geometry?.type),
    ),
  }

  const existing = map.getSource('poi-areas')
  if (existing) {
    existing.setData(data)
    applyLayerVisibility()
    return
  }

  map.addSource('poi-areas', { type: 'geojson', data })
  map.addLayer({
    id: 'poi-areas-fill',
    type: 'fill',
    source: 'poi-areas',
    paint: { 'fill-color': cssVar('--green-400'), 'fill-opacity': 0.45 },
  })
  map.addLayer({
    id: 'poi-areas-line',
    type: 'line',
    source: 'poi-areas',
    paint: { 'line-color': cssVar('--green-600'), 'line-width': 2 },
  })
  applyLayerVisibility()
}

function drawPois() {
  if (!map || !props.pois) return
  poiMarkers.forEach(({ marker }) => marker.remove())
  poiMarkers = []
  for (const f of props.pois.features ?? []) {
    if (f.geometry?.type !== 'Point') continue // Polygone: s. drawPoiAreas()
    const coords = f.geometry.coordinates
    const iconUrl = poiIconUrls[f.properties.icon]

    const el = document.createElement('div')
    el.style.cssText =
      'width:30px;height:30px;border-radius:50%;background:#fff;' +
      `border:2px solid ${cssVar('--c-primary')};` +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 1px 3px rgba(0,0,0,.4);cursor:pointer;' +
      'z-index:1;'
    if (iconUrl) {
      const img = document.createElement('img')
      img.src = iconUrl
      img.alt = ''
      img.style.cssText = 'width:18px;height:18px;'
      el.appendChild(img)
    }
    el.addEventListener('click', () => {
      emit('poi-click', f.properties.id)
      map.flyTo({ center: coords, zoom: 16, duration: 600 })
    })

    poiMarkers.push({
      key: f.properties.type,
      marker: new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map),
    })
  }
  drawPoiAreas()
  applyLayerVisibility()
}

function applyLayerVisibility() {
  if (!map) return
  const toggle = (entries, visibleFn) => {
    for (const { key, marker } of entries) {
      marker.getElement().style.visibility = visibleFn(key) ? '' : 'hidden'
    }
  }
  toggle(markers, isVisible)
  toggle(poiMarkers, isPoiVisible)

  if (userMarker) {
    userMarker.getElement().style.visibility = isVisible('user-location') ? '' : 'hidden'
  }

  const routeVis = isVisible('walk-route') ? 'visible' : 'none'
  for (const id of ['routes-casing', 'routes-line', 'route-remaining-line']) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', routeVis)
  }

  const hidden = hiddenPoiTypes.value
  for (const id of ['poi-areas-fill', 'poi-areas-line']) {
    if (map.getLayer(id)) {
      map.setFilter(id, hidden.length ? ['!', ['in', ['get', 'type'], ['literal', hidden]]] : null)
    }
  }
}

// Legenden-Checkbox umgelegt -> Layer ein-/ausblenden
watch(layerVisible, applyLayerVisibility, { deep: true })

watch(() => props.locations, drawMarkers, { deep: true })
watch(() => props.activeId, drawMarkers)
watch([() => props.arrivedId, () => props.locations], drawArrival, { deep: true })
watch(() => props.routes, drawRoutes, { deep: true })
watch(() => props.pois, drawPois, { deep: true })

// Auto-Ausschnitt neu setzen, wenn sich Inhalt oder Fokus ändert.
watch(
  [() => props.routes, () => props.locations, () => props.activeId, () => props.focus],
  fitContent,
  { deep: true },
)

watch(
  () => props.routeColor,
  () => {
    if (!map) return
    if (map.getLayer('routes-line') && !props.nav) {
      map.setPaintProperty('routes-line', 'line-color', routeColorExpr())
    }
    if (map.getLayer('route-remaining-line')) {
      map.setPaintProperty('route-remaining-line', 'line-color', routeLineColor())
    }
  },
)

onBeforeUnmount(() => {
  clearTimeout(walkBtnTimer)
  clearTimeout(recenterTimer)
  cancelAnimationFrame(markerAnim)
  markers.forEach(({ marker }) => marker.remove())
  poiMarkers.forEach(({ marker }) => marker.remove())
  removeArrival()
  map?.remove()
  map = null
})

onActivated(() => nextTick(() => map?.resize()))

defineExpose({
  resize: () => nextTick(() => map?.resize()),
})

function openWidget() {
  emit('open-climate')
}

// --- "Klima-Walk starten" ein-/ausblenden -----------------------------------
const WALK_BTN_IDLE = 4000 // ms Stillstand bis zum Ausblenden
const walkBtnVisible = ref(true)
let walkBtnTimer = null

function showWalkButton() {
  walkBtnVisible.value = true
  clearTimeout(walkBtnTimer)
  walkBtnTimer = setTimeout(() => (walkBtnVisible.value = false), WALK_BTN_IDLE)
}

const warningsOpen = ref(false)
function openWarnings() {
  warningsOpen.value = true
}

// Refs für Kompass und Nutzer-Standort
const compassEl = ref(null)
const { coords: userLocation, course } = useGeolocation()
let userMarker = null
let navBearing = null

const BEARING_EASE = 0.12

// Dämpfen der Kartendrehung
function smoothBearing(target) {
  if (target == null) return map.getBearing()
  if (navBearing == null) navBearing = target
  const diff = ((target - navBearing + 540) % 360) - 180 // -180..180
  navBearing = (navBearing + diff * BEARING_EASE + 360) % 360
  return navBearing
}

const NAV_ZOOM = 17 // Zoom in Navigationsmodus
const following = ref(true)

// Kompass-Button als Umschalter:
//   folgt gerade  -> loslassen und nach Norden ausrichten (Karte lesen)
//   folgt nicht   -> zurück auf den Nutzer und wieder mitziehen
function toggleCamera() {
  if (!map) return

  if (following.value) {
    following.value = false
    map.easeTo({ bearing: 0, pitch: 0, duration: 600 })
    return
  }

  following.value = true
  if (!userLocation.value) {
    // Ohne Standort bleibt nur das Ausrichten
    map.easeTo({ bearing: 0, pitch: 0, duration: 600 })
    return
  }
  map.easeTo({
    center: userLocation.value,
    zoom: Math.max(map.getZoom(), props.nav ? NAV_ZOOM : 15),
    pitch: props.nav ? 55 : 0,
    bearing: props.nav ? (course.value ?? map.getBearing()) : 0,
    duration: 600,
  })
}

// Nutzer-Standort: blauer Punkt + Blickrichtungs-"Kegel" (Google-Maps-artiger Puck).
const MARKER_EASE_MS = 700

let markerAnim = null
let markerPos = null
let markerHeading = null

const angleDelta = (from, to) => ((to - from + 540) % 360) - 180

function snapMarker(toCoords, toHeading) {
  markerPos = toCoords
  userMarker.setLngLat(toCoords)
  if (toHeading != null) {
    markerHeading = toHeading
    userMarker.setRotation(toHeading)
  }
}

function easeMarker(toCoords, toHeading) {
  if (!userMarker || !toCoords) return
  if (document.hidden) {
    cancelAnimationFrame(markerAnim)
    snapMarker(toCoords, toHeading)
    return
  }

  const fromPos = markerPos ?? toCoords
  const fromHeading = markerHeading
  const startedAt = performance.now()

  cancelAnimationFrame(markerAnim)
  const step = (now) => {
    const t = Math.min(1, (now - startedAt) / MARKER_EASE_MS)
    markerPos = [
      fromPos[0] + (toCoords[0] - fromPos[0]) * t,
      fromPos[1] + (toCoords[1] - fromPos[1]) * t,
    ]
    userMarker.setLngLat(markerPos)

    if (toHeading != null) {
      markerHeading =
        fromHeading == null
          ? toHeading
          : (fromHeading + angleDelta(fromHeading, toHeading) * t + 360) % 360
      userMarker.setRotation(markerHeading)
    }
    if (t < 1) markerAnim = requestAnimationFrame(step)
  }
  markerAnim = requestAnimationFrame(step)
}

function updateUserMarker(coords) {
  if (userMarker) return
  const el = document.createElement('div')
  el.style.cssText = 'width: 28px; height: 28px;'
  el.innerHTML = `
    <div class="puck-cone" style="
      position: absolute; left: 50%; top: 50%;
      width: 0; height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 20px solid ${cssVar('--blue-400')};
      opacity: 0.55;
      transform: translate(-50%, -26px);
      transition: opacity 200ms ease;
    "></div>
    <div style="
      position: absolute; left: 50%; top: 50%;
      width: 16px; height: 16px;
      margin: -8px 0 0 -8px;
      background-color: ${cssVar('--blue-400')};
      border-radius: 50%;
      border: 3px solid ${cssVar('--c-white')};
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>
  `
  userMarker = new maplibregl.Marker({
    element: el,
    rotationAlignment: 'map',
    pitchAlignment: 'map',
  })
    .setLngLat(coords)
    .addTo(map)
  markerPos = coords
  applyLayerVisibility()
}

function updateConeVisibility(headingDeg) {
  const cone = userMarker?.getElement().querySelector('.puck-cone')
  if (cone) cone.style.opacity = headingDeg != null ? '0.55' : '0'
}

function followUser(coords, headingDeg) {
  if (!map || !props.nav || !following.value) return
  map.easeTo({
    center: coords,
    zoom: Math.max(map.getZoom(), NAV_ZOOM),
    pitch: 55,
    bearing: headingDeg != null ? smoothBearing(headingDeg) : map.getBearing(),
    duration: MARKER_EASE_MS,
    easing: (t) => t,
  })
}

// --- Nutzer im Bild halten -------------------------------------------------
const OFFSCREEN_GRACE = 5000 // ms
let lastInteraction = 0
let recenterTimer = null

function keepUserVisible(coords) {
  if (!map || !coords || following.value) return // im Folgen-Modus ohnehin zentriert
  if (Date.now() - lastInteraction < OFFSCREEN_GRACE) return
  if (map.getBounds().contains(coords)) return
  map.easeTo({ center: coords, duration: 800 })
}

function scheduleRecenter() {
  clearTimeout(recenterTimer)
  recenterTimer = setTimeout(() => keepUserVisible(userLocation.value), OFFSCREEN_GRACE + 100)
}

function updatePuck(coords, deg) {
  if (!userMarker || !coords) return
  updateConeVisibility(deg)
  easeMarker(coords, deg)
  followUser(coords, deg)
}

// Jede neue Position: Marker setzen, Reststrecke nachziehen, ggf. ins Bild holen.
function applyPosition(coords) {
  if (!coords || !map) return
  emit('user-location', coords) // nach außen: für Distanzberechnung im Nav-Screen
  updateUserMarker(coords)
  updateRemaining(coords)
  keepUserVisible(coords)
}

watch(userLocation, applyPosition)
watch([userLocation, course], ([coords, deg]) => updatePuck(coords, deg))

// Startanimation bei Navigation
watch(
  () => props.nav,
  (isNav) => {
    if (isNav && map && userLocation.value) {
      map.flyTo({ center: userLocation.value, zoom: NAV_ZOOM, pitch: 55, duration: 1200 })
    }
  },
)

function stripSourceAttributions() {
  const sources = map.getStyle()?.sources ?? {}
  for (const id of Object.keys(sources)) {
    const src = map.getSource(id)
    if (src) src.attribution = ''
  }
}

// Layer des Basiskarten-Styles ein-/ausschalten (ids aus @/data/basemap).
const setBasemapLayers = (ids, visibility) => {
  for (const id of ids ?? []) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility)
  }
}

onMounted(() => {
  loadWarnings()

  map = new maplibregl.Map({
    container: mapEl.value,
    style: basemap.styleUrl,
    center: props.center,
    zoom: props.zoom,
    attributionControl: { compact: true, customAttribution: MAP_ATTRIBUTION },
    minZoom: 11,
  })

  map.on('load', () => {
    styleReady = true
    stripSourceAttributions()
    if (basemap.show3dBuildings) setBasemapLayers(basemap.buildings3dLayers, 'visible')
    setBasemapLayers(basemap.hiddenLayers, 'none')

    drawPois()
    drawMarkers()
    drawArrival()
    drawRoutes()
    fitContent()
    emit('bearing', map.getBearing())
    showWalkButton() // sichtbar starten, dann nach Stillstand ausblenden

    map.on('dragstart', () => {
      following.value = false
    })

    for (const ev of ['dragstart', 'zoomstart', 'rotatestart']) {
      map.on(ev, () => {
        lastInteraction = Date.now()
        showWalkButton()
      })
    }
    for (const ev of ['dragend', 'zoomend', 'rotateend']) {
      map.on(ev, () => {
        lastInteraction = Date.now()
        scheduleRecenter()
      })
    }

    /* Rotate compass */
    map.on('rotate', () => {
      const bearing = map.getBearing()
      if (compassEl.value) {
        compassEl.value.style.transform = `rotate(${bearing * -1}deg)`
      }
      emit('bearing', bearing)
    })

    applyPosition(userLocation.value) // Standort ggf. schon vor dem Kartenstart bekannt
    updatePuck(userLocation.value, course.value)
  })
})

function openRouteWalks() {
  router.push('/routen')
}
</script>

<template>
  <div class="map-container" :class="{ 'is-nav': nav }">
    <div ref="mapEl" class="map"></div>

    <MapLegend :search="search" :nav="nav" :route-color="routeColor" />

    <WarningsOverlay :open="warningsOpen" @close="warningsOpen = false" />

    <div v-if="search || nav" class="interactables">
      <div v-if="search" class="search-wrapper">
        <div class="searchbar">
          <AppIcon name="buch" :size="26" class="search-icon" @click="router.push('/routen')" />
          <input v-model="query" type="text" placeholder="Standort suchen" />
          <span class="material-symbols-outlined" v-if="query" @click="query = ''">close</span>
        </div>
        <div v-if="searchResults.length" class="search-results">
          <ul>
            <SearchResult v-for="loc in searchResults" :key="loc.id" :result="loc" />
          </ul>
        </div>
      </div>
      <div class="controls">
        <div
          ref="compassEl"
          class="compass-btn"
          :class="{ 'is-following': following }"
          :title="following ? 'Nach Norden ausrichten' : 'Auf Standort zentrieren'"
          @click="toggleCamera"
        >
          <span class="material-symbols-outlined">navigation</span>
        </div>
        <div class="klima-widget" @click="openWidget()">
          <AppIcon name="temperatur" class="thermo-icon" :size="28" />
        </div>
        <div v-if="warnings.length" class="warnings" @click="openWarnings()">
          <span class="material-symbols-outlined">warning</span>
        </div>
      </div>
      <AppButton
        v-if="search"
        class="start-walk"
        :class="{ 'is-hidden': !walkBtnVisible }"
        @click="openRouteWalks()"
        >Klima-Walk starten</AppButton
      >
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container.is-nav {
  isolation: isolate;
}

.map {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.map :deep(.maplibregl-popup) {
  z-index: 3;
}

/* Ankunfts-Karte über dem erreichten Standort */
.map :deep(.arrival-popup) {
  z-index: 4;
}
.map :deep(.arrival-popup .maplibregl-popup-content) {
  padding: 0;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  animation: arrival-in 0.28s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}
.map :deep(.arrival-popup .maplibregl-popup-close-button) {
  width: 22px;
  height: 22px;
  font-size: 16px;
  line-height: 1;
  color: var(--c-text-muted);
}
.map :deep(.arrival-card) {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg) var(--sp-md) var(--sp-md);
  font-family: var(--ff-base);
  cursor: pointer;
}
.map :deep(.arrival-num) {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-accent);
  color: var(--c-white);
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
}
.map :deep(.arrival-body) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.map :deep(.arrival-kicker) {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-text-muted);
}
.map :deep(.arrival-name) {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-primary);
}
.map :deep(.arrival-go) {
  margin-left: auto;
  color: var(--c-primary);
}

@keyframes arrival-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.interactables {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: var(--z-map-overlay);
  pointer-events: none;

  span.material-symbols-outlined {
    font-size: var(--fs-2xl);
    color: var(--c-primary);
    cursor: pointer;
  }

  .start-walk {
    position: absolute;
    bottom: var(--sp-xl);
    left: 20px;
    width: calc(100% - 40px);
    transition:
      opacity 0.35s ease,
      transform 0.35s ease;
  }

  .start-walk.is-hidden {
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .interactables .start-walk {
    transition: none;
  }
  .interactables .start-walk.is-hidden {
    transform: none;
  }
}

.controls {
  position: absolute;
  top: calc(var(--safe-top) + 70px);
  right: var(--sp-lg);
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  z-index: 2;

  .thermo-icon {
    color: var(--c-primary);
  }
}
.controls > div {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.is-nav .controls {
  top: calc(var(--safe-top) + 90px);
}

.compass-btn.is-following {
  background: var(--c-primary);
}
.compass-btn.is-following span.material-symbols-outlined {
  color: var(--c-white);
}

.searchbar,
.search-results,
.controls,
.interactables .start-walk {
  pointer-events: auto;
}

.search-wrapper {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;

  .search-results {
    position: absolute;
    top: 68px;
    left: 12px;
    width: calc(100% - 24px);
    max-height: 180px;
    overflow-y: auto;
    z-index: 5;

    &::-webkit-scrollbar {
      display: none;
    }

    ul {
      display: flex;
      flex-direction: column;
      gap: var(--sp-xs);
    }
  }
}

.searchbar .search-icon {
  color: var(--c-primary);
  cursor: pointer;
}

.searchbar {
  position: absolute;
  top: calc(var(--safe-top) + 15px);
  margin: 0 var(--sp-lg);
  width: calc(100% - var(--sp-lg) * 2);
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--sp-sm);
  background: var(--c-bg);
  border: 2px solid var(--c-primary);
  border-radius: 28px;
  padding: var(--sp-xs) var(--sp-md);
  box-shadow: var(--shadow-md);

  input {
    width: 100%;
    font-family: var(--ff-base);
    font-size: var(--fs-md);
    padding: var(--sp-sm) 0;

    /* no standard */
    border: none;
    outline: none;
    background: transparent;
  }
}

.warnings span.material-symbols-outlined {
  color: var(--c-accent);
}
</style>
