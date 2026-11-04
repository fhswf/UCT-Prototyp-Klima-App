<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ClimateMap from '@/components/map/ClimateMap.vue'
import AppIcon from '@/components/AppIcon.vue'
import { walkIcon, walkColor } from '@/icons'
import { useWalkSession } from '@/composables/useWalkSession'
import AppButton from '../ui/AppButton.vue'

// Ersetzt im Routenmodus das KlimaWalkWidget:
// Karte mit Route + Walk-Kopf, "nächster Standort" und Standort-Checkliste.
const props = defineProps({
  walk: { type: Object, required: true }, // { id, name, category, stops, route_points }
  currentId: { type: [Number, String], default: null }, // Aktueller Standort der Route
})

const router = useRouter()
const { isVisited, toggleVisited } = useWalkSession()

const stops = computed(() => props.walk?.stops ?? [])

const currentIndex = computed(() =>
  stops.value.findIndex((s) => String(s.id) === String(props.currentId)),
)

// Nächster noch nicht besuchter Standort
const nextStop = computed(() => {
  const rest = stops.value.slice(currentIndex.value + 1)
  return rest.find((s) => !isVisited(props.walk.id, s.id)) ?? rest[0] ?? null
})

// route_points (GeoJSON-Geometrie)
const routeFC = computed(() =>
  props.walk?.route_points
    ? {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: props.walk.route_points, properties: {} }],
      }
    : null,
)

const accent = computed(() => walkColor(props.walk))

const goToStop = (stop) => {
  if (!stop) return
  router.push({ name: 'Standort', params: { id: stop.id }, query: { walk: props.walk.id } })
}

// Zurück in die aktive Navigations-Ansicht
const goToNavigation = () => {
  router.push({ name: 'WalkGo', params: { id: props.walk.id } })
}
</script>

<template>
  <div class="route-progress">
    <!-- Tour-Name + nächster Standort -->
    <header class="walk-head">
      <span class="badge"><AppIcon :name="walkIcon(walk.name)" :size="22" /></span>
      <span class="walk-name">{{ walk.name }}</span>
    </header>

    <p v-if="nextStop" class="next-stop" @click="goToStop(nextStop)">
      <span class="label">Nächster Standort: </span>
      <strong>{{ nextStop.name }}</strong>
    </p>

    <div class="map-box">
      <ClimateMap
        :routes="routeFC"
        :locations="stops"
        :active-id="currentId"
        :route-color="accent"
        focus="route"
      />
    </div>

    <!-- Standorte mit Checkboxen -->
    <ul class="stop-list">
      <li
        v-for="stop in stops"
        :key="stop.id"
        class="stop"
        :class="{ 'stop--current': String(stop.id) === String(currentId) }"
      >
        <input
          type="checkbox"
          :checked="isVisited(walk.id, stop.id)"
          @change="toggleVisited(walk.id, stop.id)"
        />
        <button class="stop-name" @click="goToStop(stop)">
          <span class="idx">{{ stop.id }}</span>
          {{ stop.name }}
        </button>
      </li>
      <AppButton class="start-btn" @click="goToNavigation">Zur Navigation</AppButton>
    </ul>
  </div>
</template>

<style scoped>
.route-progress {
  background: var(--c-bg-secondary);
  padding-bottom: var(--sp-lg);
}
.map-box {
  height: 300px;
}
.walk-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  color: var(--c-primary);
  font-weight: var(--fw-bold);
  font-size: var(--fs-lg);

  .badge {
    flex-shrink: 0;
    width: 26px;
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-primary);
    background: var(--c-bg);
  }
}

.next-stop {
  gap: var(--sp-sm);
  padding: 0 var(--sp-lg) var(--sp-md);
  cursor: pointer;
  text-align: center;
}
.next-stop .label {
  color: var(--c-text-muted);
}
.stop-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-lg);
}
.stop {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}
.stop input[type='checkbox'] {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  accent-color: var(--c-primary);
  cursor: pointer;
}
.stop-name {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  text-align: left;
  background: var(--c-bg);
  border: none;
  border-radius: var(--r-md);
  font-family: var(--ff-base);
  font-size: 16px;
  cursor: pointer;
}
.stop--current .stop-name {
  outline: 2px solid var(--c-primary);
}
.idx {
  color: var(--c-text-muted);
  font-weight: var(--fw-bold);
}
</style>
