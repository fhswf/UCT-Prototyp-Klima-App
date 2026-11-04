<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '@/services/api'
import { useApi } from '@/composables/useApi'
import { useFavorites, FAV_ROUTE } from '@/composables/useFavorites'
import { useGeolocation } from '@/composables/useGeolocation'
import RouteCard from '@/components/cards/RouteCard.vue'
import TabBar from '@/components/ui/TabBar.vue'
import RouteFilter from '@/components/filter/RouteFilter.vue'
import SortMenu from '@/components/filter/SortMenu.vue'
import ListToolbar from '@/components/layout/ListToolbar.vue'
import EmptyView from '@/views/EmptyView.vue'
import {
  countActiveFilters,
  emptyRouteFilter,
  filterRoutes,
  routePoints,
  routeSortOptions,
  sortRoutes,
  withDistance,
  withNearbyPois,
} from '@/lib/listQuery'

const { data: routesFC, error, load } = useApi(api.routes)
const { data: pois, load: loadPois } = useApi(api.pois)

const routes = computed(
  () => routesFC.value?.features.map((f) => ({ ...f.properties, geometry: f.geometry })) ?? [],
)

const { isFav, toggle } = useFavorites()
const { coords, hasPosition } = useGeolocation()

const tabs = [
  { key: 'routes', label: 'Klima-Walks Soest' },
  { key: 'myRoutes', label: 'Meine Walks' },
]
const activeTab = ref('routes')

/* ---------------- Anreichern: POIs entlang der Route, Entfernung ---------------- */

// Getrennte Schritte, damit die teure POI-Suche nicht bei jedem GPS-Tick neu läuft.
const routesWithPois = computed(() => withNearbyPois(routes.value, pois.value, routePoints))
const decorated = computed(() => withDistance(routesWithPois.value, coords.value, routePoints))

/* ---------------- Filter ---------------- */

const filterOpen = ref(false)
const filter = ref(emptyRouteFilter())
const filterCount = computed(() => countActiveFilters(filter.value))

// Zielgruppen-Auswahl aus den geladenen Routen (statt einer zweiten Pflegeliste).
const audiences = computed(() => {
  const seen = new Map()
  for (const r of routes.value) {
    for (const a of r.audiences ?? []) if (!seen.has(a.key)) seen.set(a.key, a)
  }
  return [...seen.values()]
})

/* ---------------- Sortierung ---------------- */

const sortKey = ref('name-asc')
const sortOpen = ref(false)

const sortOptions = computed(() =>
  routeSortOptions.map((o) => ({
    ...o,
    disabled: o.needsPosition && !hasPosition.value,
    hint: 'braucht deinen Standort',
  })),
)
const sortLabel = computed(
  () => sortOptions.value.find((o) => o.key === sortKey.value)?.label ?? '',
)

// Standortfreigabe verweigert/verloren -> nicht auf einer toten Sortierung stehen bleiben.
watch(hasPosition, (has) => {
  if (!has && routeSortOptions.find((o) => o.key === sortKey.value)?.needsPosition) {
    sortKey.value = 'name-asc'
  }
})

/* ---------------- Ergebnislisten ---------------- */

const visibleRoutes = computed(() =>
  sortRoutes(
    filterRoutes(decorated.value, filter.value, { isFav: (id) => isFav(FAV_ROUTE, id) }),
    sortKey.value,
  ),
)

// "Meine Walks": alle Favoriten, unabhängig vom Filter der anderen Liste.
const favRoutes = computed(() =>
  sortRoutes(
    decorated.value.filter((r) => isFav(FAV_ROUTE, r.id)),
    sortKey.value,
  ),
)

onMounted(() => {
  load()
  loadPois()
})
</script>

<template>
  <RouteFilter
    v-model="filter"
    :open="filterOpen"
    :audiences="audiences"
    @close="filterOpen = false"
  />
  <SortMenu :open="sortOpen" :options="sortOptions" v-model="sortKey" @close="sortOpen = false" />

  <div class="sticky-header">
    <TabBar :tabs="tabs" :modelValue="activeTab" @update:modelValue="activeTab = $event" />
    <!-- Filter gilt nur für die volle Liste; "Meine Walks" zeigt immer alle Favoriten. -->
    <ListToolbar
      v-if="activeTab === 'routes'"
      class="bar"
      :sortLabel="sortLabel"
      :filterCount="filterCount"
      @open-sort="sortOpen = true"
      @open-filter="filterOpen = true"
    />
  </div>

  <div class="routen">
    <!-- Tab: alle Klima-Walks -->
    <template v-if="activeTab === 'routes'">
      <EmptyView
        v-if="error"
        icon="cloud_off"
        title="Keine Verbindung"
        text="Die Walks konnten nicht geladen werden."
      />
      <EmptyView
        v-else-if="!visibleRoutes.length"
        icon="search_off"
        title="Keine Treffer"
        text="Für diese Filter gibt es keine Walks."
      />
      <ul v-else class="card-grid">
        <RouteCard
          v-for="route in visibleRoutes"
          :key="route.id"
          :route="route"
          :fav="isFav(FAV_ROUTE, route.id)"
          @toggle-fav="toggle(FAV_ROUTE, route.id)"
        />
      </ul>
    </template>

    <!-- Tab: Meine Walks (Favoriten) -->
    <template v-else>
      <EmptyView
        v-if="!favRoutes.length"
        title="Noch keine Favoriten"
        text="Tippe auf das Herz eines Walks, um ihn hier zu sammeln."
      />
      <ul v-else class="card-grid">
        <RouteCard
          v-for="route in favRoutes"
          :key="route.id"
          :route="route"
          :fav="true"
          @toggle-fav="toggle(FAV_ROUTE, route.id)"
        />
      </ul>
    </template>
  </div>
</template>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding-top: var(--safe-top);
  background: var(--c-bg);
}

.routen {
  min-height: 100%;
  background-color: var(--c-bg-secondary);
}

.card-grid {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  padding: var(--sp-md);
}

.bar {
  padding: var(--sp-md);
  background-color: var(--c-bg-secondary);
}
</style>
