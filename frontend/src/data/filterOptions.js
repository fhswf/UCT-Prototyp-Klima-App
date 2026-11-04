import { mapLayers } from '@/composables/useMapLayers'

// Auswahlmöglichkeiten der Filter-Overlays ("Overlay Routen filtern",
// "Overlay Standorte filtern")

export const markedOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'fav', label: 'Favoriten' },
]

export const quartettOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'only', label: 'Klima-Quartett' },
]

// Werte = ENUM `difficulty` aus schema_redaktion.sql
export const difficultyOptions = [
  { value: 'leicht', label: 'leicht' },
  { value: 'mittel', label: 'mittel' },
  { value: 'schwer', label: 'schwer' },
]

// POI-Typen: dieselbe Quelle wie Karte und Legende (poi_types.key).
export const poiOptions = mapLayers
  .filter((l) => l.poiType)
  .map((l) => ({ value: l.poiType, label: l.label }))

// Radius für "POIs in der Nähe"
export const POI_NEARBY_RADIUS = 100

// Routenlänge in km
export const lengthBuckets = [
  { value: 'lt2', label: '< 2 km', min: 0, max: 2 },
  { value: '2-4', label: '2–4 km', min: 2, max: 4 },
  { value: 'gt4', label: '> 4 km', min: 4, max: Infinity },
]

// Luftlinie zum nächsten Standort in Metern.
export const distanceBuckets = [
  { value: 'lt200', label: '< 200 m', min: 0, max: 200 },
  { value: '200-500', label: '200–500 m', min: 200, max: 500 },
  { value: 'gt500', label: '> 500 m', min: 500, max: Infinity },
]

// Liegt `value` im gewählten Topf? Ohne Auswahl (null) passt alles; ein
// unbekannter Wert (z. B. Entfernung ohne GPS) fällt heraus.
export function inBucket(value, bucketValue, buckets) {
  if (!bucketValue) return true
  const b = buckets.find((x) => x.value === bucketValue)
  if (!b) return true
  if (value == null || !Number.isFinite(value)) return false
  return value >= b.min && value < b.max
}
