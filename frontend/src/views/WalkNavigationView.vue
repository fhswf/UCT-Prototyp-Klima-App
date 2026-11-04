<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClimateMap from '@/components/map/ClimateMap.vue'
import ClimateWidget from '@/components/map/ClimateWidget.vue'
import AppIcon from '@/components/AppIcon.vue'
import AbortWalk from '@/components/ui/AbortWalk.vue'
import EditWalk from '@/components/ui/EditWalk.vue'
import BadgeUnlock from '@/components/trophies/BadgeUnlock.vue'
import { walkIcon, walkColor } from '@/icons'
import { useWalkSession } from '@/composables/useWalkSession'
import { useAchievements } from '@/composables/useAchievements'
import { useApi } from '@/composables/useApi'
import { api } from '@/services/api'
import { bearing, distanceAlong, haversine, nearestOnLine } from '@/lib/geo'

const route = useRoute()
const router = useRouter()
const { ensureWalk, walkFor, progress, stopWalk, abortWalk, markVisited, setVisited } =
  useWalkSession()
const { data: pois, load: loadPois } = useApi(api.pois)
const { isFresh } = useAchievements()

const id = computed(() => route.params.id)
const walk = computed(() => walkFor(id.value))
const stops = computed(() => walk.value?.stops ?? [])
const accent = computed(() => walkColor(walk.value))

const routeFC = computed(() =>
  walk.value?.route_points
    ? {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: walk.value.route_points, properties: {} }],
      }
    : null,
)

const visitedIds = computed(() => progress.value[String(id.value)] ?? [])
const visitedCount = computed(() => visitedIds.value.length) // -> dein "0/10"
const nextStop = computed(() => stops.value.find((s) => !visitedIds.value.includes(s.id)) ?? null)

onMounted(() => {
  if (!walk.value) ensureWalk(id.value)
  loadPois()
}) // Deep-Link/Reload-Fallback

// --- Distanz zum nächsten Stop ---------------------------------------------
// ClimateMap meldet den User-Standort per @user-location nach außen.
const userLocation = ref(null)
function onUserLocation(coords) {
  userLocation.value = coords
}

// Routen-Polylinie ([[lng,lat], …]) für Distanz & Richtung entlang des Wegs.
const routeLine = computed(() => {
  const g = walk.value?.route_points
  return g?.type === 'LineString' ? g.coordinates : null
})

// Luftlinie zum nächsten Stop – Grundlage für die Ankunftserkennung.
const directToNext = computed(() => {
  const from = userLocation.value
  const to = nextStop.value?.location?.coordinates
  return from && to ? haversine(from, to) : null
})

// Ab dieser Abweichung von der Route ist die Strecke "entlang des Wegs" nicht
// mehr aussagekräftig: der User wird dann irgendwo auf die Linie projiziert.
const OFF_ROUTE = 40 // m

// Angezeigte Distanz: ENTLANG der Route (nicht Luftlinie), solange der User
// halbwegs auf dem Weg ist. Sonst Luftlinie – sonst stünden dort 0 m, obwohl
// man noch quer durch die Stadt muss.
const distanceToNext = computed(() => {
  const line = routeLine.value
  const from = userLocation.value
  const to = nextStop.value?.location?.coordinates
  if (!from || !to) return null
  if (line) {
    const snap = nearestOnLine(line, from)
    if (snap && snap.dist <= OFF_ROUTE) {
      const d = distanceAlong(line, from, to)
      if (d != null) return Math.round(d)
    }
  }
  return Math.round(haversine(from, to))
})

// --- Automatisches Abhaken bei Ankunft -------------------------------------
const ARRIVAL_RADIUS = 12 // m
const finished = ref(false)

// Erreichter Standort: die Karte zeigt eine Karte über dem Marker. Der Artikel
// öffnet sich erst auf Tippen – sonst reißt er die Navigation aus dem Blick.
const arrivedStop = ref(null)

watch(directToNext, (d) => {
  const stop = nextStop.value
  if (d == null || !stop || d > ARRIVAL_RADIUS) return
  const isLast = visitedIds.value.length + 1 >= stops.value.length
  markVisited(id.value, stop.id) // idempotent -> nextStop rückt automatisch weiter
  if (isLast) {
    finished.value = true
  } else {
    arrivedStop.value = stop
  }
})

// Tippen auf die Ankunfts-Karte -> Artikel des Standorts.
function openArrivedStop(stop) {
  arrivedStop.value = null
  router.push({ name: 'Standort', params: { id: stop.id }, query: { walk: id.value } })
}

/* Wenn alle Stops abgehakt werden */
watch(visitedCount, (n) => {
  if (stops.value.length && n >= stops.value.length) finished.value = true
})

// Badge, das beim Abschluss gefeiert wird. Der Abschluss selbst wird über den
// Fortschritt in useAchievements verbucht (auch beim Abhaken per Checkliste).
const unlockedBadge = computed(() =>
  walk.value
    ? { title: walk.value.name, icon: walkIcon(walk.value.name), color: accent.value }
    : null,
)

// Beim ersten Mal ist es ein neuer Erfolg, danach ein weiterer Durchgang.
const unlockKicker = computed(() =>
  isFresh(id.value) ? 'Erfolg freigeschaltet' : 'Walk abgeschlossen',
)

function finishWalk() {
  finished.value = false
  stopWalk()
  router.push('/erfolge')
}

/* Richtungspfeil: zeigt entlang des Wegs (nächster Stützpunkt der Route
   voraus) */
const indicator = ref(null)
const mapBearing = ref(0) // aktueller Drehwinkel der Karte (von ClimateMap gemeldet)

function updateIndicator() {
  const el = indicator.value
  const line = routeLine.value
  if (!el || !userLocation.value) return

  let brg
  if (line) {
    const snap = nearestOnLine(line, userLocation.value)
    const ahead = line[Math.min(snap.index + 1, line.length - 1)]
    brg = bearing(userLocation.value, ahead)
  } else if (nextStop.value?.location?.coordinates) {
    brg = bearing(userLocation.value, nextStop.value.location.coordinates)
  } else {
    return
  }
  // Kartendrehung abziehen -> Pfeil zeigt auch bei rotierter Karte korrekt.
  el.style.transform = `rotate(${brg - mapBearing.value}deg)`
}

onMounted(updateIndicator)
watch([userLocation, nextStop, mapBearing], updateIndicator)

// --- Navigation ------------------------------------------------------------
// Balken tippen -> nächster Standort im Routen-Vorschaumodus (mit Prev/Next-Pfeilen).
function goToNextStop() {
  if (!nextStop.value) return
  router.push({ name: 'Standort', params: { id: nextStop.value.id }, query: { walk: id.value } })
}

// Klima-Widget (Thermostat-Button der Karte)
const climateOpen = ref(false)

// Abbruch-Dialog
const abortOpen = ref(false)
function confirmAbort() {
  abortWalk(id.value) // Session beenden + Fortschritt dieses Durchgangs verwerfen
  abortOpen.value = false
  router.push('/routen')
}

const editOpen = ref(false)
function onSaveProgress(newVisitedIds) {
  setVisited(id.value, newVisitedIds)
  editOpen.value = false
}
</script>

<template>
  <div class="walk-nav">
    <ClimateMap
      :routes="routeFC"
      :locations="stops"
      :pois="pois"
      :active-id="nextStop?.id"
      :arrived-id="arrivedStop?.id"
      :route-color="accent"
      nav
      @user-location="onUserLocation"
      @bearing="mapBearing = $event"
      @open-climate="climateOpen = true"
      @arrival-click="openArrivedStop"
      @arrival-close="arrivedStop = null"
    />

    <!-- Top HUD -->
    <header class="hud">
      <div>
        <div>
          <AppIcon :name="walkIcon(walk?.name)" :size="18" style="margin-right: 4px" />
          <strong>{{ walk?.name }}: {{ visitedCount }}/{{ stops.length }}</strong>
        </div>
        <p>
          nach:
          <span class="next-stop-name">{{ nextStop?.name }}, Standort {{ nextStop?.id }}</span>
        </p>
      </div>
      <div class="actions">
        <button @click="editOpen = true">
          <AppIcon name="stift" :size="16"></AppIcon>
        </button>
        <button @click="abortOpen = true">
          <span class="material-symbols-outlined" style="font-size: 18px">close</span>
        </button>
      </div>
    </header>

    <!-- Bottom -->
    <button class="segment" @click="goToNextStop">
      <span
        ><span ref="indicator" id="indicator" class="material-symbols-outlined">arrow_upward</span>
        {{ distanceToNext ?? '–' }} m</span
      >&nbsp; nach
      {{ nextStop?.name }}
    </button>

    <!-- Klima-Widget (Thermostat-Button der Karte) -->
    <ClimateWidget
      :open="climateOpen"
      :location="nextStop ?? stops[0]"
      @close="climateOpen = false"
    />

    <!-- Abbruch-Bestätigung -->
    <AbortWalk :open="abortOpen" @cancel="abortOpen = false" @confirm="confirmAbort" />

    <!-- Bearbeiten-Dialog -->
    <EditWalk
      v-model:open="editOpen"
      :items="stops"
      :visited-ids="visitedIds"
      @save="onSaveProgress"
    />

    <!-- Abschluss: alle Standorte erreicht -->
    <BadgeUnlock
      :open="finished"
      :badge="unlockedBadge"
      :kicker="unlockKicker"
      :subtitle="`Walk abgeschlossen – alle ${stops.length} Standorte erreicht.`"
      @close="finishWalk"
    />
  </div>
</template>

<style scoped>
.walk-nav {
  position: relative;
  height: 100%;
}

.hud {
  position: absolute;
  top: calc(var(--safe-top) + 15px);
  padding: var(--sp-md) var(--sp-lg);
  left: var(--sp-lg);
  width: calc(100% - var(--sp-lg) * 2);

  display: flex;
  justify-content: space-between;

  background: var(--c-bg);
  border-radius: var(--r-lg);
  border: 2px solid var(--c-primary);
}

button.segment {
  position: absolute;
  bottom: var(--sp-xl);
  left: var(--sp-lg);
  width: calc(100% - var(--sp-lg) * 2);
  height: 76px;

  display: flex;
  align-items: center;

  background: var(--c-secondary);
  color: var(--c-text);
  font-weight: var(--fw-semibold);
  font-size: 18px;
  font-family: var(--ff-base);
  border-radius: var(--r-lg);
  border: 2px solid var(--c-primary);
  padding: var(--sp-md) var(--sp-lg);

  span {
    display: flex;
    align-items: center;
    color: var(--c-accent);
  }
}

#indicator {
  width: 24px;
  aspect-ratio: 1/1;
}

.actions {
  display: flex;
  gap: var(--sp-sm);

  button {
    background: none;
    border: none;
    color: var(--c-text);
    aspect-ratio: 1/1;
    width: 38px;
    border-radius: var(--r-pill);
    cursor: pointer;
    border: 2px solid var(--c-text);

    span {
      font-weight: var(--fw-light);
    }
  }
}

.next-stop-name {
  font-weight: var(--fw-semibold);
  color: var(--c-primary);
  font-size: var(--fs-sm);
}
</style>
