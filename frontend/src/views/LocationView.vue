<script setup>
import { ref, computed, onScopeDispose, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, offFresh } from '@/services/api'
import { renderMarkdown } from '@/utils/markdown'
import ArticleHero from '@/components/article/ArticleHero.vue'
import ArticleBody from '@/components/article/ArticleBody.vue'
import ClimateStats from '@/components/article/ClimateStats.vue'
import AppCollapsible from '@/components/ui/AppCollapsible.vue'
import KlimaWalkWidget from '@/components/article/KlimaWalkWidget.vue'
import RouteProgressWidget from '@/components/article/RouteProgressWidget.vue'
import LogosFooter from '@/components/article/LogosFooter.vue'
import { climateCategories } from '@/data/climateCategories'
import { useWalkSession } from '@/composables/useWalkSession'
import { useFavorites, FAV_LOCATION } from '@/composables/useFavorites'

const routeParams = useRoute()
const router = useRouter()
const { ensureWalk, walkFor, stopsFor } = useWalkSession()
const { isFav, toggle } = useFavorites()

const location = ref(null)
const locationWalksFC = ref(null)

const allWalks = computed(() => locationWalksFC.value?.features.map((f) => f.properties) ?? [])

const shortTextHtml = computed(() => renderMarkdown(location.value?.short_text))

// --- Routenmodus -----------------------------------------------------------
const walkId = computed(() => routeParams.query.walk ?? null)
const inRoute = computed(() => walkId.value != null)

const stops = computed(() => stopsFor(walkId.value))
const currentIndex = computed(() =>
  stops.value.findIndex((s) => String(s.id) === String(routeParams.params.id)),
)
const prevStop = computed(() =>
  currentIndex.value > 0 ? stops.value[currentIndex.value - 1] : null,
)
const nextStop = computed(() => stops.value[currentIndex.value + 1] ?? null)
const activeWalk = computed(() => walkFor(walkId.value))

const mapLocations = computed(() => {
  const byId = new Map()
  for (const f of locationWalksFC.value?.features ?? []) {
    for (const s of f.properties.stops ?? []) {
      if (!byId.has(s.id)) byId.set(s.id, s)
    }
  }
  return [...byId.values()]
})

const slideDir = ref('next')

function goBack() {
  if (inRoute.value && !window.history.state?.back) {
    router.replace({ name: 'Walk', params: { id: walkId.value } })
  } else {
    router.back()
  }
}

function goToStop(stop, dir) {
  if (!stop) return
  slideDir.value = dir
  router.replace({
    name: 'Standort',
    params: { id: stop.id },
    query: { ...routeParams.query, walk: walkId.value },
  })
}

// --- Laden -----------------------------------------------------------------
let loadedId = null

const onLocation = (fresh) => {
  if (String(fresh.id) === String(loadedId)) location.value = fresh
}
const onLocationWalks = (fresh) => {
  if (String(routeParams.params.id) === String(loadedId)) locationWalksFC.value = fresh
}
onScopeDispose(() => {
  offFresh(onLocation)
  offFresh(onLocationWalks)
})

async function load() {
  const id = routeParams.params.id
  loadedId = id
  location.value = await api.location(id, onLocation)
  if (inRoute.value) {
    await ensureWalk(walkId.value) // Stop-Reihenfolge sicherstellen
    return
  }

  try {
    locationWalksFC.value = await api.locationWalks(id, onLocationWalks)
  } catch (e) {
    console.warn('locationWalks fehlgeschlagen:', e)
    locationWalksFC.value = { type: 'FeatureCollection', features: [] }
  }
}

watch(() => routeParams.params.id, load, { immediate: true })
</script>

<template>
  <Transition :name="`slide-${slideDir}`" mode="out-in">
    <div class="standort" v-if="location" :key="location.id">
      <ArticleHero
        :title="location.name"
        :subtitle="`Standort ${location.station_number ?? location.id}`"
        :image="location.thumbnail_url"
        :show-nav="inRoute"
        :has-prev="!!prevStop"
        :has-next="!!nextStop"
        :fav="isFav(FAV_LOCATION, location.id)"
        @update:fav="toggle(FAV_LOCATION, location.id)"
        @back="goBack"
        @prev="goToStop(prevStop, 'prev')"
        @next="goToStop(nextStop, 'next')"
      />

      <!-- Intro -->
      <p class="temp">
        <AppIcon name="temperatur" size="24" />
        Aktuelle Lufttemperatur: 26°C
      </p>
      <div class="short-text" v-html="shortTextHtml" />

      <!-- Lokale Klimainformationen -->
      <!-- has-sensor kommt aus der Klimadaten-DB, sobald sie angebunden ist -->
      <ClimateStats :categories="climateCategories" :has-sensor="false" />

      <!-- Standortinformationen -->
      <AppCollapsible title="Standortinformationen" theme="standort">
        <ArticleBody :blocks="location.body" />
      </AppCollapsible>

      <!-- Klima-Walk: im Routenmodus Fortschritts-Widget, sonst Walk-Liste -->
      <AppCollapsible title="Klima-Walk" theme="walk" default-open>
        <RouteProgressWidget
          v-if="inRoute && activeWalk"
          :walk="activeWalk"
          :current-id="location.id"
        />
        <KlimaWalkWidget
          v-else
          :walks="allWalks"
          :routes="locationWalksFC"
          :locations="mapLocations"
          :active-id="location.id"
        />
      </AppCollapsible>

      <LogosFooter />
    </div>
  </Transition>
</template>

<style scoped>
.temp {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-lg) var(--sp-lg) 0;
  color: var(--c-primary);
  font-weight: var(--fw-semibold);
}
.short-text {
  padding: var(--sp-lg);
  line-height: 1.5;
}
.short-text :deep(p) {
  margin: 0 0 var(--sp-md);
}
.short-text :deep(p:last-child) {
  margin-bottom: 0;
}
.short-text :deep(ul),
.short-text :deep(ol) {
  margin: 0 0 var(--sp-md);
  padding-left: 1.25em;
}
.short-text :deep(li) {
  margin-bottom: var(--sp-xs);
}
.short-text :deep(a) {
  color: var(--c-primary);
}

/* Slide-Transition zwischen Standorten */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
