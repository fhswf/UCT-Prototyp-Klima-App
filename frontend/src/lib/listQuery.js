// Filtern und Sortieren der Listen (Klima-Walks, Standorte).

import { distanceToGeometry, haversine, nearestDistance } from '@/lib/geo'
import {
  POI_NEARBY_RADIUS,
  difficultyOptions,
  distanceBuckets,
  inBucket,
  lengthBuckets,
} from '@/data/filterOptions'

/* ---------------------------------------------------------------- Filtermodelle */

export const emptyRouteFilter = () => ({
  marked: 'all',
  audiences: [],
  pois: [],
  difficulty: [],
  length: null,
  distance: null,
})

export const emptyTopicFilter = () => ({
  marked: 'all',
  categories: [],
})

export const emptyLocationFilter = () => ({
  marked: 'all',
  audiences: [],
  pois: [],
  distance: null,
  quartett: 'all',
})

// Zahl fürs Badge im ListToolbar. Mehrfachauswahl zählt jeden Haken einzeln,
// eine Einfachauswahl zählt 1 — außer sie steht auf dem Standard ('all'/null).
export function countActiveFilters(filter) {
  return Object.values(filter).reduce((n, v) => {
    if (Array.isArray(v)) return n + v.length
    if (v == null || v === 'all') return n
    return n + 1
  }, 0)
}

/* ------------------------------------------------------------------- Anreichern */

// Stützpunkte, an denen ein Eintrag "ist": bei Routen die Standorte (fallback
// auf die Linie), bei Standorten der eine Punkt.
export const routePoints = (r) => {
  const stops = (r.stops ?? []).map((s) => s.location?.coordinates).filter(Boolean)
  if (stops.length) return stops
  return r.geometry?.type === 'LineString' ? r.geometry.coordinates : []
}

export const locationPoints = (l) => (l.location?.coordinates ? [l.location.coordinates] : [])

/* --- POI-Umkreissuche -------------------------------------------------------*/

const M_PER_DEG_LAT = 111320

function buildPoiIndex(pois, radius) {
  const grid = new Map() // "cx:cy" -> [{ type, coordinates }]
  const areas = [] // Polygone: wenige, werden linear geprüft
  const features = pois?.features ?? []

  // Zellgröße in Grad. cos(Breite) ist über eine Stadt praktisch konstant,
  // deshalb reicht die Breite des ersten POI als Bezug.
  const refLat = features.find((f) => f.geometry?.coordinates)?.geometry.coordinates.flat(9)[1] ?? 0
  const dLat = radius / M_PER_DEG_LAT
  const dLng = radius / (M_PER_DEG_LAT * Math.max(Math.cos((refLat * Math.PI) / 180), 0.1))
  const key = (lng, lat) => `${Math.floor(lng / dLng)}:${Math.floor(lat / dLat)}`

  for (const f of features) {
    const type = f.properties?.type
    if (!type || !f.geometry) continue
    if (f.geometry.type === 'Point') {
      const c = f.geometry.coordinates
      const k = key(c[0], c[1])
      const bucket = grid.get(k)
      if (bucket) bucket.push({ type, coordinates: c })
      else grid.set(k, [{ type, coordinates: c }])
    } else {
      areas.push({ type, geometry: f.geometry })
    }
  }

  // POI-Typen im Umkreis der übergebenen Punkte.
  function typesNear(points) {
    const found = new Set()
    if (!points.length) return found
    for (const p of points) {
      const [cx, cy] = [Math.floor(p[0] / dLng), Math.floor(p[1] / dLat)]
      for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
          for (const poi of grid.get(`${x}:${y}`) ?? []) {
            if (found.has(poi.type)) continue
            if (haversine(p, poi.coordinates) <= radius) found.add(poi.type)
          }
        }
      }
      for (const a of areas) {
        if (found.has(a.type)) continue
        const d = distanceToGeometry(p, a.geometry)
        if (d != null && d <= radius) found.add(a.type)
      }
    }
    return found
  }

  return { typesNear }
}

export function withNearbyPois(items, pois, pointsOf, radius = POI_NEARBY_RADIUS) {
  if (!pois?.features?.length) return items.map((it) => ({ ...it, poi_types: new Set() }))
  const index = buildPoiIndex(pois, radius)
  return items.map((it) => ({ ...it, poi_types: index.typesNear(pointsOf(it)) }))
}

// Luftlinie zum nächstgelegenen Punkt des Eintrags (m)
export function withDistance(items, user, pointsOf) {
  if (!user) return items.map((it) => ({ ...it, distance_m: null }))
  return items.map((it) => ({ ...it, distance_m: nearestDistance(user, pointsOf(it)) }))
}

/* ---------------------------------------------------------------------- Filtern */

// Mehrfachauswahl wirkt als ODER: leere Auswahl lässt alles durch, sonst muss
// mindestens ein gewählter Wert vorkommen.
const matchesAny = (selected, own) => !selected.length || selected.some((v) => own.includes(v))

const matchesPois = (selected, types) => !selected.length || selected.some((v) => types.has(v))

export function filterRoutes(routes, f, { isFav }) {
  return routes.filter((r) => {
    if (f.marked === 'fav' && !isFav(r.id)) return false
    if (
      !matchesAny(
        f.audiences,
        (r.audiences ?? []).map((a) => a.key),
      )
    )
      return false
    if (!matchesPois(f.pois, r.poi_types ?? new Set())) return false
    if (f.difficulty.length && !f.difficulty.includes(r.difficulty)) return false
    if (!inBucket(r.distance_km, f.length, lengthBuckets)) return false
    if (!inBucket(r.distance_m, f.distance, distanceBuckets)) return false
    return true
  })
}

export function filterLocations(locations, f, { isFav }) {
  return locations.filter((l) => {
    if (f.marked === 'fav' && !isFav(l.id)) return false
    if (f.quartett === 'only' && !l.in_klima_quartett) return false
    if (
      !matchesAny(
        f.audiences,
        (l.audiences ?? []).map((a) => a.key),
      )
    )
      return false
    if (!matchesPois(f.pois, l.poi_types ?? new Set())) return false
    if (!inBucket(l.distance_m, f.distance, distanceBuckets)) return false
    return true
  })
}

/* -------------------------------------------------------------------- Sortieren */

// Einträge ohne Wert (z. B. Entfernung ohne GPS-Fix) landen immer am Ende.
const byNumber =
  (get, dir = 1) =>
  (a, b) => {
    const x = get(a)
    const y = get(b)
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    return (x - y) * dir
  }

const byText =
  (get, dir = 1) =>
  (a, b) =>
    (get(a) ?? '').localeCompare(get(b) ?? '') * dir

const difficultyRank = (r) => {
  const i = difficultyOptions.findIndex((d) => d.value === r.difficulty)
  return i === -1 ? null : i
}

// Redaktionell hervorgehobene zuerst, der Rest alphabetisch.
const byFeatured = (a, b) =>
  a.featured === b.featured ? (a.name ?? '').localeCompare(b.name ?? '') : a.featured ? -1 : 1

// `needsPosition` blendet die Sortierung aus, solange kein GPS-Fix vorliegt.
export const routeSortOptions = [
  { key: 'name-asc', label: 'Name (A bis Z)' },
  { key: 'name-desc', label: 'Name (Z bis A)' },
  { key: 'length-asc', label: 'Länge (kurz zuerst)' },
  { key: 'length-desc', label: 'Länge (lang zuerst)' },
  { key: 'distance-asc', label: 'Entfernung (nächste zuerst)', needsPosition: true },
  { key: 'difficulty-asc', label: 'Schwierigkeit (leicht zuerst)' },
]

export const locationSortOptions = [
  { key: 'number-asc', label: 'Standortnummer (aufsteigend)' },
  { key: 'number-desc', label: 'Standortnummer (absteigend)' },
  { key: 'name-asc', label: 'Name (A bis Z)' },
  { key: 'name-desc', label: 'Name (Z bis A)' },
  { key: 'distance-asc', label: 'Entfernung (nächster zuerst)', needsPosition: true },
  { key: 'distance-desc', label: 'Entfernung (weitester zuerst)', needsPosition: true },
  { key: 'interesting', label: 'Interessanteste zuerst' },
]

export const topicSortOptions = [
  { key: 'name-asc', label: 'Name (A bis Z)' },
  { key: 'name-desc', label: 'Name (Z bis A)' },
  { key: 'interesting', label: 'Interessanteste zuerst' },
]

const routeComparators = {
  'name-asc': byText((r) => r.name),
  'name-desc': byText((r) => r.name, -1),
  'length-asc': byNumber((r) => r.distance_km),
  'length-desc': byNumber((r) => r.distance_km, -1),
  'distance-asc': byNumber((r) => r.distance_m),
  'difficulty-asc': byNumber(difficultyRank),
}

const stationNumber = (l) => l.station_number ?? l.id

const locationComparators = {
  'number-asc': byNumber(stationNumber),
  'number-desc': byNumber(stationNumber, -1),
  'name-asc': byText((l) => l.name),
  'name-desc': byText((l) => l.name, -1),
  'distance-asc': byNumber((l) => l.distance_m),
  'distance-desc': byNumber((l) => l.distance_m, -1),
  interesting: byFeatured,
}

const topicComparators = {
  'name-asc': byText((t) => t.name),
  'name-desc': byText((t) => t.name, -1),
  interesting: byFeatured,
}

// sort() mutiert – deshalb immer auf einer Kopie arbeiten.
const sortBy = (comparators) => (list, key) => {
  const cmp = comparators[key]
  return cmp ? [...list].sort(cmp) : list
}

export const sortRoutes = sortBy(routeComparators)
export const sortLocations = sortBy(locationComparators)
export const sortTopics = sortBy(topicComparators)
