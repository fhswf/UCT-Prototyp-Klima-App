<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useApi } from '@/composables/useApi'
import ClimateMap from '@/components/map/ClimateMap.vue'
import ClimateWidget from '@/components/map/ClimateWidget.vue'
import PoiWidget from '@/components/map/PoiWidget.vue'
import { useWalkSession } from '@/composables/useWalkSession'
import { walkColor } from '@/icons'

const router = useRouter()
const { data: locations, load } = useApi(api.locations)
const { data: pois, load: loadPois } = useApi(api.pois)
const { session, walkFor, ensureWalk } = useWalkSession()
const modalOpen = ref(false)

const activePoi = ref(null)

// aktiver walk
const activeWalk = computed(() =>
  session.value?.mode === 'active' ? walkFor(session.value.walkId) : null,
)

const routeFC = computed(() =>
  activeWalk.value?.route_points
    ? {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: activeWalk.value.route_points, properties: {} },
        ],
      }
    : null,
)

const mapLocations = computed(() => activeWalk.value?.stops ?? locations.value ?? [])
const accent = computed(() => (activeWalk.value ? walkColor(activeWalk.value) : ''))
const focus = computed(() => (activeWalk.value ? 'route' : 'none'))

onMounted(() => {
  load()
  loadPois()
})

watch(
  () => session.value?.mode === 'active' && session.value.walkId,
  (walkId) => {
    if (walkId) ensureWalk(walkId)
  },
  { immediate: true },
)

// Pin-Klicks
function onLocationClick(loc) {
  router.push(`/standort/${loc.id}`)
}

async function onPoiClick(id) {
  activePoi.value = await api.poi(id)
}

// Thermostat-Icon -> Klima-Modal
function openClimate() {
  modalOpen.value = true
}
</script>

<template>
  <div class="karte">
    <ClimateMap
      :locations="mapLocations"
      :pois="pois"
      :routes="routeFC"
      :route-color="accent"
      :focus="focus"
      search
      @location-click="onLocationClick"
      @poi-click="onPoiClick"
      @open-climate="openClimate"
    />
    <ClimateWidget :open="modalOpen" :location="locations?.[0]" @close="modalOpen = false" />
    <PoiWidget :poi="activePoi" @close="activePoi = null" />
  </div>
</template>

<style scoped>
.karte {
  position: relative;
  height: 100%;
}
</style>
