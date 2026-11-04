<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import ArticleHero from '@/components/article/ArticleHero.vue'
import ArticleBody from '@/components/article/ArticleBody.vue'
import AppCollapsible from '@/components/ui/AppCollapsible.vue'
import ClimateMap from '@/components/map/ClimateMap.vue'
import LocationCard from '@/components/cards/LocationCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { walkColor } from '@/icons'
import { useWalkSession } from '@/composables/useWalkSession'
import { useGeolocation } from '@/composables/useGeolocation'
import { useFavorites, FAV_ROUTE } from '@/composables/useFavorites'

const routeParams = useRoute()
const router = useRouter()
const { startWalk, abortWalk, session } = useWalkSession()
const { requestCompass } = useGeolocation()
const { isFav, toggle } = useFavorites()
const routeFC = ref(null)

const walkId = () => routeParams.params.id

// Läuft dieser Walk gerade aktiv? -> Button zeigt "abbrechen" statt "starten".
const isActive = computed(
  () => session.value?.mode === 'active' && String(session.value.walkId) === String(walkId()),
)

// Link-Ziel für einen Standort im Vorschaumodus (Session vorab füllen).
function stopLink(stop) {
  return { name: 'Standort', params: { id: stop.id }, query: { walk: walkId() } }
}

// Walk aktiv starten: Session anlegen (verwirft den Fortschritt eines früheren
// Durchgangs) und in die aktive Navigations-Ansicht wechseln.
function startKlimaWalk() {
  requestCompass()
  startWalk(walk.value, 'active')
  router.push({ name: 'WalkGo', params: { id: walkId() } })
}

// Zurück in die laufende Navigation (z.B. nach Tab-Wechsel).
function resumeKlimaWalk() {
  router.push({ name: 'WalkGo', params: { id: walkId() } })
}

// Aktiven Walk abbrechen: Session beenden + Fortschritt verwerfen
// -> Button springt zurück auf "starten", Haken sind wieder leer.
function cancelKlimaWalk() {
  abortWalk(walkId())
}

// Platzhalter, bis /routes/:id geladen ist (Form wie die API).
const walk = ref({
  name: 'Beispiel-Walk',
  distance_km: 3.2,
  difficulty: 'leicht',
  audiences: [],
  category: null,
  thumbnail_url: '',
  body: [],
  stops: [],
  route_points: null,
})

// Zielgruppen-Namen aus [{ key, name }] als Text.
const audienceNames = computed(() => walk.value.audiences?.map((a) => a.name).join(', ') ?? '')

// Kategorie-Farbe für die Routenlinie auf der Karte.
const accent = computed(() => walkColor(walk.value))

function applyWalk(data) {
  walk.value = data
  routeFC.value = data.route_points
    ? {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: data.route_points, properties: {} }],
      }
    : null
}

onMounted(async () => {
  try {
    applyWalk(await api.route(routeParams.params.id, applyWalk))
  } catch (e) {
    console.warn('Walk konnte nicht geladen werden, nutze Platzhalter:', e)
  }
})
</script>

<template>
  <div class="walk" v-if="walk">
    <ArticleHero
      :title="walk.name"
      :image="walk.thumbnail_url"
      :walk-name="walk.name"
      theme="walk"
      :fav="isFav(FAV_ROUTE, walkId())"
      @back="router.back()"
      @update:fav="toggle(FAV_ROUTE, walkId())"
    />

    <!-- Meta -->
    <dl class="meta">
      <dt>Länge:</dt>
      <dd>{{ walk.distance_km }} km</dd>
      <template v-if="walk.category">
        <dt>Kategorie:</dt>
        <dd>{{ walk.category.name }}</dd>
      </template>
      <template v-if="walk.difficulty">
        <dt>Schwierigkeit:</dt>
        <dd>{{ walk.difficulty }}</dd>
      </template>
      <template v-if="audienceNames">
        <dt>Zielgruppen:</dt>
        <dd>{{ audienceNames }}</dd>
      </template>
    </dl>

    <ArticleBody :blocks="walk.body" />

    <AppCollapsible title="Standorte dieser Route" theme="walk" class="collapsible" default-open>
      <div class="map-box">
        <ClimateMap :routes="routeFC" :locations="walk.stops" :route-color="accent" focus="route" />
      </div>
      <h2>Standorte dieser Route:</h2>
      <p>
        Klicke auf einen der Standorte, um zur Vorschau zu gelangen oder um den Walk zu beginnen
      </p>
      <ul class="stop-list">
        <LocationCard
          v-for="stop in walk.stops"
          :key="stop.id"
          :location="stop"
          :to="stopLink(stop)"
        />
        <template v-if="isActive">
          <AppButton class="start-walk" @click="resumeKlimaWalk()">Weiter navigieren</AppButton>
          <AppButton class="start-walk cancel-walk" @click="cancelKlimaWalk()"
            >Klima-Walk abbrechen</AppButton
          >
        </template>
        <AppButton v-else class="start-walk" @click="startKlimaWalk()"
          >Klima-Walk starten</AppButton
        >
      </ul>
    </AppCollapsible>
  </div>
</template>

<style scoped>
.meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--sp-sm) var(--sp-md);
  padding: var(--sp-lg);
  color: var(--c-primary);
}
.meta dt {
  font-weight: var(--fw-regular);
}
.meta dd {
  font-weight: var(--fw-bold);
}

.collapsible {
  background: var(--c-bg-secondary);

  h2 {
    text-align: center;
    margin: var(--sp-xl) 0;
    font-family: var(--ff-base);
    font-size: var(--fs-md);
    color: var(--c-primary);
    font-weight: var(--fw-bold);
  }

  p {
    margin: 0 var(--sp-lg) var(--sp-sm);
    font-family: var(--ff-base);
    font-weight: var(--fw-regular);
    font-size: var(--fs-sm);
    color: var(--c-text);
  }
}

.map-box {
  height: 300px;
}
.stop-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-lg);
}

.start-walk {
  margin: var(--sp-md) 0;
  width: 100%;
}
.cancel-walk {
  background: transparent;
  box-shadow: none;
  color: var(--c-text-muted);
}
</style>
