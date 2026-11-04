<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '@/services/api'
import { useApi } from '@/composables/useApi'
import { useAchievements } from '@/composables/useAchievements'
import { useWalkSession } from '@/composables/useWalkSession'
import { walkIcon, walkColor, walkColors } from '@/icons'
import { conceptBadges, masterBadge, categoryTexts } from '@/data/achievements'
import BadgeTile from '@/components/trophies/BadgeTile.vue'
import BadgeDetail from '@/components/trophies/BadgeDetail.vue'
import EmptyView from '@/views/EmptyView.vue'

const { data: routesFC, error, load } = useApi(api.routes)
const { progress } = useWalkSession()
const { isWalkDone, walkProgress, doneAt, runCount, syncWalks, isFresh } = useAchievements()

const walks = computed(
  () => routesFC.value?.features.map((f) => ({ ...f.properties, geometry: f.geometry })) ?? [],
)

// Auch abgehakte Standorte ohne aktive Navigation sollen den Badge füllen:
// sobald die Liste da ist (und bei jeder Änderung am Fortschritt) prüfen.
watch([walks, progress], () => syncWalks(walks.value), { deep: true })

// Eine durchgehende Seite: Gesamtstand, Master-Badge, dann die Segmente.

const dateLabel = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

/* ---------------- Walk-Badges: einer je Klima-Walk ---------------- */

const visited = (walk) => {
  const ids = new Set(progress.value[String(walk.id)] ?? [])
  return (walk.stops ?? []).filter((s) => ids.has(s.id)).length
}

const walkBadges = computed(() =>
  walks.value.map((walk) => {
    const total = walk.stops?.length ?? 0
    const earned = isWalkDone(walk.id)
    const runs = runCount(walk.id)
    return {
      id: `walk-${walk.id}`,
      title: walk.name,
      text: total
        ? `Hake alle ${total} Standorte des Walks "${walk.name}" ab.`
        : `Laufe den Walk "${walk.name}" komplett ab.`,
      icon: walkIcon(walk.name),
      color: walkColor(walk),
      progress: walkProgress(walk),
      earned,
      locked: false,
      celebrate: isFresh(walk.id),
      caption: earned ? 'geschafft' : `${visited(walk)}/${total}`,
      meta: earned
        ? `Freigeschaltet am ${dateLabel(doneAt(walk.id))}${runs > 1 ? ` · ${runs}× gelaufen` : ''}`
        : `${visited(walk)} von ${total} Standorten abgehakt`,
      to: `/walk/${walk.id}`,
      linkLabel: earned ? 'Walk noch mal laufen' : 'Zum Walk',
    }
  }),
)

const doneWalks = computed(() => walks.value.filter((w) => isWalkDone(w.id)))
const allWalksDone = computed(
  () => walks.value.length > 0 && doneWalks.value.length === walks.value.length,
)

// Master-Badge: alle Walks abgeschlossen.
const masterTile = computed(() => {
  const total = walks.value.length
  const done = doneWalks.value.length
  const open = total - done
  return {
    ...masterBadge,
    progress: total ? done / total : 0,
    earned: allWalksDone.value,
    locked: false,
    celebrate: allWalksDone.value && walks.value.some((w) => isFresh(w.id)),
    caption: `${done}/${total} Walks`,
    meta: allWalksDone.value
      ? 'Alle Klima-Walks in Soest abgeschlossen. Respekt!'
      : `Noch ${open} Walk${open === 1 ? '' : 's'} bis zum Champion.`,
  }
})

/* ---------------- Kategorie-Badges ---------------- */

const categoryBadges = computed(() => {
  const byKey = new Map()
  for (const walk of walks.value) {
    const cat = walk.category
    if (!cat?.key) continue // Walks ohne Kategorie (z. B. Campus Tour)
    if (!byKey.has(cat.key)) byKey.set(cat.key, { ...cat, walks: [] })
    byKey.get(cat.key).walks.push(walk)
  }

  return [...byKey.values()].map((cat) => {
    const total = cat.walks.length
    const done = cat.walks.filter((w) => isWalkDone(w.id)).length
    const earned = done === total
    return {
      id: `category-${cat.key}`,
      title: cat.name,
      text: categoryTexts[cat.key] ?? `Schließe alle Walks der Kategorie "${cat.name}" ab.`,
      icon: walkIcon(cat.name),
      color: walkColors[cat.key] ?? 'var(--c-primary)',
      progress: total ? done / total : 0,
      earned,
      locked: false,
      celebrate: earned && cat.walks.some((w) => isFresh(w.id)),
      caption: `${done}/${total} Walks`,
      meta: earned
        ? 'Kategorie komplett abgeschlossen.'
        : `${done} von ${total} Walks dieser Kategorie geschafft.`,
    }
  })
})

/* ---------------- Weitere Erfolge ---------------- */

const conceptTiles = computed(() =>
  conceptBadges.map((b) => ({
    ...b,
    progress: 0,
    earned: false,
    locked: true,
    caption: '',
    meta: '',
  })),
)

/* ---------------- Kopfzeile: Gesamtstand ---------------- */

const earnedTotal = computed(
  () =>
    walkBadges.value.filter((b) => b.earned).length +
    categoryBadges.value.filter((b) => b.earned).length +
    (allWalksDone.value ? 1 : 0),
)
const badgeTotal = computed(() => walkBadges.value.length + categoryBadges.value.length + 1)

/* ---------------- Detail-Overlay ---------------- */

const selected = ref(null)

onMounted(load)
</script>

<template>
  <div class="trophies">
    <header class="page-head">
      <h1>Erfolge</h1>
      <p>Deine Badges für Klima-Walks in Soest</p>
    </header>

    <EmptyView
      v-if="error"
      icon="cloud_off"
      title="Keine Verbindung"
      text="Deine Erfolge konnten nicht geladen werden."
    />

    <template v-else>
      <!-- Gesamtstand -->
      <section class="summary">
        <div class="summary-text">
          <strong>{{ earnedTotal }} von {{ badgeTotal }}</strong>
          <span>Erfolgen freigeschaltet</span>
        </div>
        <div class="bar">
          <div
            class="bar-fill"
            :style="{ width: `${badgeTotal ? (earnedTotal / badgeTotal) * 100 : 0}%` }"
          />
        </div>
      </section>

      <!-- Master-Badge: alle Walks -->
      <section class="master" :class="{ 'master--earned': masterTile.earned }">
        <BadgeTile
          :icon="masterTile.icon"
          :color="masterTile.color"
          :progress="masterTile.progress"
          :earned="masterTile.earned"
          :celebrate="masterTile.celebrate"
          :size="92"
          @select="selected = masterTile"
        />
        <div class="master-text">
          <h2>{{ masterTile.title }}</h2>
          <p>{{ masterTile.meta }}</p>
          <div class="bar bar--master">
            <div class="bar-fill" :style="{ width: `${masterTile.progress * 100}%` }" />
          </div>
        </div>
      </section>

      <!-- Segment: ein Badge je Walk -->
      <section class="segment">
        <h3 class="section-title">Walks</h3>
        <p class="section-hint">
          Der Ring füllt sich mit jedem abgehakten Standort. Alle Standorte abgehakt = Badge
          freigeschaltet.
        </p>
        <div class="grid">
          <BadgeTile
            v-for="badge in walkBadges"
            :key="badge.id"
            v-bind="badge"
            @select="selected = badge"
          />
        </div>
      </section>

      <!-- Segment: Kategorien -->
      <section class="segment">
        <h3 class="section-title">Kategorien</h3>
        <p class="section-hint">Schließe alle Walks einer Kategorie ab, um ihr Badge zu färben.</p>
        <div class="grid">
          <BadgeTile
            v-for="badge in categoryBadges"
            :key="badge.id"
            v-bind="badge"
            @select="selected = badge"
          />
        </div>
      </section>

      <!-- Segment: Erfolge für besondere Gewohnheiten -->
      <section class="segment">
        <h3 class="section-title">Besondere Erfolge</h3>
        <p class="section-hint">
          Für Ausdauer, Regelmäßigkeit und alles, was du dir unterwegs erlaufen kannst.
        </p>
        <div class="grid">
          <BadgeTile
            v-for="badge in conceptTiles"
            :key="badge.id"
            v-bind="badge"
            @select="selected = badge"
          />
        </div>
      </section>
    </template>
  </div>

  <BadgeDetail :badge="selected" @close="selected = null" />
</template>

<style scoped>
.trophies {
  min-height: 100%;
  padding: calc(var(--safe-top) + var(--sp-xl)) var(--sp-md) var(--sp-xl);
  background: var(--c-bg-secondary);
}

/* Seitentitel laeuft mit dem Inhalt mit (nicht sticky) */
.page-head {
  padding: 0 var(--sp-xs) var(--sp-lg);
}
.page-head h1 {
  font-family: var(--ff-display);
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  line-height: 1.2;
  color: var(--c-primary);
}
.page-head p {
  font-size: var(--fs-sm);
  font-weight: var(--fw-light);
  color: var(--c-text);
}

/* Gesamtstand */
.summary {
  padding: var(--sp-lg);
  margin-bottom: var(--sp-md);
  background: var(--c-bg);
  border-radius: var(--r-md);
}
.summary-text {
  display: flex;
  align-items: baseline;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-sm);
  color: var(--c-primary);
}
.summary-text strong {
  font-family: var(--ff-display);
  font-size: var(--fs-lg);
}
.summary-text span {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

.bar {
  height: 8px;
  border-radius: var(--r-pill);
  background: var(--c-border);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: var(--r-pill);
  background: var(--c-primary);
  transition: width 0.5s ease;
}

/* Master-Badge */
.master {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  margin-bottom: var(--sp-lg);
  background: var(--c-bg);
  border: 2px solid var(--c-border);
  border-radius: var(--r-md);
}
.master--earned {
  border-color: var(--c-accent);
}
.master-text {
  flex: 1;
  min-width: 0;
}
.master-text h2 {
  font-family: var(--ff-display);
  font-size: var(--fs-md);
  color: var(--c-primary);
}
.master-text p {
  margin: 2px 0 var(--sp-sm);
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}
.bar--master .bar-fill {
  background: var(--c-accent);
}

.segment + .segment {
  margin-top: var(--sp-xl);
}

.section-title {
  margin: 0 var(--sp-xs) 2px;
  font-family: var(--ff-display);
  font-size: var(--fs-md);
  color: var(--c-primary);
}
.section-hint {
  margin: 0 var(--sp-xs) var(--sp-md);
  font-size: var(--fs-xs);
  color: var(--c-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md) var(--sp-sm);
  padding: var(--sp-lg) var(--sp-sm);
  background: var(--c-bg);
  border-radius: var(--r-md);
}
</style>
