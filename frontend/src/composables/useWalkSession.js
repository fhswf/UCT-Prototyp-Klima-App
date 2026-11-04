import { ref, watch } from 'vue'
import { api } from '@/services/api'

// Session-Zustand für den "aktiven"/"Vorschau"-Routenmodus.
// - session: welcher Walk gerade begangen wird + Modus ('preview' | 'active')
// - walks:   geladene Walk-Objekte (für die Stop-Reihenfolge), gecacht nach id
// - progress: abgehakte Standorte je Walk  { [walkId]: number[] }  (persistiert)

const PROGRESS_KEY = 'klima:walk-progress'

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}

const walks = ref({}) // { [walkId]: walkObject }
const session = ref(null) // { walkId: string, mode: 'preview' | 'active' } | null
const progress = ref(loadProgress())

watch(progress, (p) => localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)), { deep: true })

// Walk laden (einmalig cachen), damit LocationView auch bei Deep-Links
// (/standort/5?walk=2) die Stop-Reihenfolge kennt.
async function ensureWalk(id) {
  const key = String(id)
  if (!walks.value[key]) {
    walks.value[key] = await api.route(id, (fresh) => {
      walks.value = { ...walks.value, [key]: fresh }
    })
  }
  return walks.value[key]
}

// Fortschritt eines Walks verwerfen (Abbruch / frischer Start).
function resetProgress(walkId) {
  const key = String(walkId)
  if (!(key in progress.value)) return
  const next = { ...progress.value }
  delete next[key]
  progress.value = next
}

// Aus einer Walk-View heraus den Modus starten (Walk-Objekt liegt schon vor).
// Ein aktiver Start ist immer ein frischer Durchgang: der Fortschritt des
// letzten Versuchs wird verworfen, sonst zeigt die Navigation sofort auf den
// Stop nach dem zuletzt abgehakten.
function startWalk(walk, mode = 'preview') {
  const key = String(walk.id)
  walks.value[key] = walk
  if (mode === 'active') resetProgress(key)
  session.value = { walkId: key, mode }
}

// Regulär beenden (Walk abgeschlossen) – Fortschritt bleibt stehen.
function stopWalk() {
  session.value = null
}

// Abbrechen – Session beenden UND den Fortschritt dieses Durchgangs verwerfen.
function abortWalk(walkId = session.value?.walkId) {
  if (walkId != null) resetProgress(walkId)
  session.value = null
}

export function useWalkSession() {
  const walkFor = (id) => (id == null ? null : (walks.value[String(id)] ?? null))
  const stopsFor = (id) => walkFor(id)?.stops ?? []

  const isVisited = (walkId, stopId) => (progress.value[String(walkId)] ?? []).includes(stopId)

  const toggleVisited = (walkId, stopId) => {
    const key = String(walkId)
    const set = new Set(progress.value[key] ?? [])
    if (set.has(stopId)) {
      set.delete(stopId)
    } else {
      set.add(stopId)
    }
    progress.value = { ...progress.value, [key]: [...set] }
  }

  // Nur hinzufügen (idempotent) – fürs automatische Abhaken bei Ankunft, damit
  // ein manuell gesetzter Haken nicht versehentlich wieder entfernt wird.
  const markVisited = (walkId, stopId) => {
    const key = String(walkId)
    const set = new Set(progress.value[key] ?? [])
    if (set.has(stopId)) return
    set.add(stopId)
    progress.value = { ...progress.value, [key]: [...set] }
  }

  const setVisited = (walkId, stopIds) => {
    progress.value = { ...progress.value, [String(walkId)]: [...new Set(stopIds)] }
  }

  return {
    // State
    walks,
    session,
    progress,
    // Aktionen
    ensureWalk,
    startWalk,
    stopWalk,
    abortWalk,
    resetProgress,
    setVisited,
    // Getter
    walkFor,
    stopsFor,
    isVisited,
    toggleVisited,
    markVisited,
  }
}
