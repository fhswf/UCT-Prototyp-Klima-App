import { computed, ref, watch } from 'vue'
import { useWalkSession } from '@/composables/useWalkSession'

const STORAGE_KEY = 'klima:achievements:v1'

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return raw && typeof raw === 'object' ? (raw.walks ?? {}) : {}
  } catch {
    return {}
  }
}

const completions = ref(loadStored())

const justUnlocked = ref(new Set())

watch(completions, (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ walks: c })), {
  deep: true,
})

function completeWalk(walk) {
  const key = String(walk?.id ?? walk)
  if (key === 'undefined' || key === 'null') return
  const now = new Date().toISOString()
  const prev = completions.value[key]
  if (!prev) justUnlocked.value = new Set(justUnlocked.value).add(key)
  completions.value = {
    ...completions.value,
    [key]: {
      firstAt: prev?.firstAt ?? now,
      lastAt: now,
      count: (prev?.count ?? 0) + 1,
    },
  }
}

const { progress, walks } = useWalkSession()

// Wie viele Stops eines Walks sind abgehakt?
const visitedCount = (walk) => {
  const visited = progress.value[String(walk.id)] ?? []
  const ids = new Set(visited)
  return (walk.stops ?? []).filter((s) => ids.has(s.id)).length
}

const wasComplete = new Map()

// Alle Stops abgehakt -> Walk gilt als abgeschlossen. Deckt auch den Weg über
// die Checklisten (RouteProgressWidget / EditWalk) ab, nicht nur die Navigation.
function syncWalk(walk) {
  const stops = walk?.stops ?? []
  if (!stops.length) return

  const key = String(walk.id)
  const complete = visitedCount(walk) >= stops.length
  const before = wasComplete.get(key)
  wasComplete.set(key, complete)

  if (!complete) return
  if (before === undefined) {
    if (!completions.value[key]) completeWalk(walk)
    return
  }
  if (!before) completeWalk(walk)
}

const syncWalks = (list) => (list ?? []).forEach(syncWalk)

// Walks, die im Session-Cache liegen, laufend prüfen – so füllt sich der Badge
// auch ohne Besuch der Erfolge-Ansicht.
watch([progress, walks], () => syncWalks(Object.values(walks.value)), {
  deep: true,
  immediate: true,
})

export function useAchievements() {
  const isWalkDone = (id) => Boolean(completions.value[String(id)])

  // Füllstand eines Walk-Badges: abgeschlossen = voll, sonst Anteil der
  // abgehakten Standorte.
  const walkProgress = (walk) => {
    if (isWalkDone(walk.id)) return 1
    const total = walk?.stops?.length ?? 0
    return total ? visitedCount(walk) / total : 0
  }

  const doneAt = (id) => completions.value[String(id)]?.firstAt ?? null
  const runCount = (id) => completions.value[String(id)]?.count ?? 0

  const doneCount = computed(() => Object.keys(completions.value).length)

  // Erfolg zurücksetzen (Debug/„Fortschritt löschen“ im Profil).
  function resetAll() {
    completions.value = {}
    justUnlocked.value = new Set()
  }

  // Wurde dieser Walk gerade eben (in dieser Sitzung) freigeschaltet?
  const isFresh = (id) => justUnlocked.value.has(String(id))

  return {
    completions,
    justUnlocked,
    isFresh,
    completeWalk,
    syncWalks,
    isWalkDone,
    walkProgress,
    doneAt,
    runCount,
    doneCount,
    resetAll,
  }
}
