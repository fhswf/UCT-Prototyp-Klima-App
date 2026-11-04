import { ref, watch } from 'vue'

// Favoriten für Routen, Standorte und Deep-Dives. Die IDs der drei Tabellen
// überschneiden sich, deshalb wird jeder Eintrag als "art:id" abgelegt.

const STORAGE_KEY = 'klima:favorites:v2'

export const FAV_ROUTE = 'route'
export const FAV_LOCATION = 'location'
export const FAV_TOPIC = 'topic'

const entryKey = (kind, id) => `${kind}:${id}`

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((k) => typeof k === 'string') : []
  } catch {
    return []
  }
}

const favorites = ref(new Set(loadStored()))

watch(favorites, (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])))

export function useFavorites() {
  const isFav = (kind, id) => favorites.value.has(entryKey(kind, id))

  // Set wird ersetzt statt mutiert -> Watcher/Computeds reagieren zuverlässig.
  const toggle = (kind, id) => {
    const key = entryKey(kind, id)
    const next = new Set(favorites.value)
    if (!next.delete(key)) next.add(key)
    favorites.value = next
  }

  return { favorites, isFav, toggle }
}
