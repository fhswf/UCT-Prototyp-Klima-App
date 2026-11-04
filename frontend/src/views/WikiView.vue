<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useApi } from '@/composables/useApi'
import LocationCard from '@/components/cards/LocationCard.vue'
import DeepDiveCard from '@/components/cards/DeepDiveCard.vue'
import TabBar from '@/components/ui/TabBar.vue'
import { useFavorites, FAV_LOCATION, FAV_TOPIC } from '@/composables/useFavorites'
import { useGeolocation } from '@/composables/useGeolocation'
import ListToolbar from '@/components/layout/ListToolbar.vue'
import LocationFilter from '@/components/filter/LocationFilter.vue'
import TopicFilter from '@/components/filter/TopicFilter.vue'
import SortMenu from '@/components/filter/SortMenu.vue'
import EmptyView from './EmptyView.vue'
import {
  countActiveFilters,
  emptyLocationFilter,
  emptyTopicFilter,
  filterLocations,
  locationPoints,
  locationSortOptions,
  sortLocations,
  sortTopics,
  topicSortOptions,
  withDistance,
  withNearbyPois,
} from '@/lib/listQuery'

const { data: locationsData, error, load } = useApi(api.locations)
const locations = computed(() => locationsData.value ?? [])

const { data: topicsData, error: topicsError, load: loadTopics } = useApi(api.topics)
const topics = computed(() => topicsData.value ?? [])

const { data: pois, load: loadPois } = useApi(api.pois)

const { toggle, isFav } = useFavorites()
const { coords, hasPosition } = useGeolocation()

const tabs = [
  { key: 'locations', label: 'Standorte' },
  { key: 'topics', label: 'Klima Deep-Dives' },
]

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab === 'topics' ? 'topics' : 'locations')

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})

/* ---------------- Standorte: Anreichern, Filter, Sortierung ---------------- */

// Zwei Schritte: die POI-Umkreissuche hängt nur an den Daten, die Entfernung am GPS.
const locationsWithPois = computed(() =>
  withNearbyPois(locations.value, pois.value, locationPoints),
)
const decoratedLocations = computed(() =>
  withDistance(locationsWithPois.value, coords.value, locationPoints),
)

const filterOpen = ref(false)
const filter = ref(emptyLocationFilter())
const filterCount = computed(() => countActiveFilters(filter.value))

// Zielgruppen kommen aus den Daten (der Standort erbt sie von seinen Walks).
const audiences = computed(() => {
  const seen = new Map()
  for (const l of locations.value) {
    for (const a of l.audiences ?? []) if (!seen.has(a.key)) seen.set(a.key, a)
  }
  return [...seen.values()]
})

const sortKey = ref('number-asc')
const sortOpen = ref(false)

const sortOptions = computed(() =>
  locationSortOptions.map((o) => ({
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
  if (!has && locationSortOptions.find((o) => o.key === sortKey.value)?.needsPosition) {
    sortKey.value = 'number-asc'
  }
})

const visibleLocations = computed(() =>
  sortLocations(
    filterLocations(decoratedLocations.value, filter.value, {
      isFav: (id) => isFav(FAV_LOCATION, id),
    }),
    sortKey.value,
  ),
)

/* ---------------- Deep-Dives: Sortierung + Filter ---------------- */
const topicFilterOpen = ref(false)
const topicFilter = ref(emptyTopicFilter())

const topicFilterCount = computed(() => countActiveFilters(topicFilter.value))

const topicSortKey = ref('name-asc')
const topicSortOpen = ref(false)

const topicSortLabel = computed(
  () => topicSortOptions.find((o) => o.key === topicSortKey.value)?.label ?? '',
)

const filteredTopics = computed(() => {
  const { marked, categories } = topicFilter.value
  return topics.value.filter((t) => {
    if (marked === 'fav' && !isFav(FAV_TOPIC, t.id)) return false
    if (categories.length) {
      const own = t.categories ?? []
      if (!categories.some((c) => own.includes(c))) return false
    }
    return true
  })
})

const sortedTopics = computed(() => sortTopics(filteredTopics.value, topicSortKey.value))

onMounted(() => {
  load()
  loadTopics()
  loadPois()
})
</script>

<template>
  <LocationFilter
    v-model="filter"
    :open="filterOpen"
    :audiences="audiences"
    @close="filterOpen = false"
  />
  <SortMenu :open="sortOpen" :options="sortOptions" v-model="sortKey" @close="sortOpen = false" />

  <TopicFilter v-model="topicFilter" :open="topicFilterOpen" @close="topicFilterOpen = false" />
  <SortMenu
    :open="topicSortOpen"
    :options="topicSortOptions"
    v-model="topicSortKey"
    @close="topicSortOpen = false"
  />

  <div class="sticky-header">
    <TabBar :tabs="tabs" :modelValue="activeTab" @update:modelValue="activeTab = $event" />
    <ListToolbar
      v-if="activeTab === 'locations'"
      class="bar"
      :sortLabel="sortLabel"
      :filterCount="filterCount"
      @open-sort="sortOpen = true"
      @open-filter="filterOpen = true"
    />
    <ListToolbar
      v-else-if="activeTab === 'topics'"
      class="bar bar--light"
      :sortLabel="topicSortLabel"
      :filterCount="topicFilterCount"
      @open-sort="topicSortOpen = true"
      @open-filter="topicFilterOpen = true"
    />
  </div>

  <!-- Tab: Standorte -->
  <template v-if="activeTab === 'locations'">
    <EmptyView
      v-if="error"
      icon="cloud_off"
      title="Keine Verbindung"
      text="Die Standorte konnten nicht geladen werden."
    />
    <EmptyView
      v-else-if="!visibleLocations.length"
      icon="search_off"
      title="Keine Treffer"
      text="Für diese Filter gibt es keine Standorte."
    />
    <ul v-else class="card-list">
      <LocationCard
        v-for="loc in visibleLocations"
        :key="loc.id"
        :location="loc"
        :fav="isFav(FAV_LOCATION, loc.id)"
        @toggle-fav="toggle(FAV_LOCATION, loc.id)"
      />
    </ul>
  </template>

  <!-- Tab: Klima Deep-Dives -->
  <template v-else-if="activeTab === 'topics'">
    <EmptyView
      v-if="topicsError"
      icon="cloud_off"
      title="Keine Verbindung"
      text="Die Klima-Deep-Dives konnten nicht geladen werden."
    />
    <EmptyView
      v-else-if="!sortedTopics.length"
      icon="search_off"
      title="Keine Treffer"
      text="Für diese Filter gibt es keine Deep-Dives."
    />
    <ul v-else class="card-list card-list--light">
      <DeepDiveCard
        v-for="topic in sortedTopics"
        :key="topic.id"
        :topic="topic"
        :fav="isFav(FAV_TOPIC, topic.id)"
        @toggle-fav="toggle(FAV_TOPIC, topic.id)"
      />
    </ul>
  </template>
</template>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding-top: var(--safe-top);
  background: var(--c-bg);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: 0 var(--sp-md) var(--sp-lg);
  background-color: var(--c-bg-primary);
  min-height: 100%;
}

.bar {
  background-color: var(--c-bg-primary);
  padding: var(--sp-md);
}

/* Deep-Dives: weiße Fläche, blaue Karten TODO */
.bar--light,
.card-list--light {
  background-color: var(--c-bg);
}
</style>
