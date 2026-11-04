import { reactive, computed } from 'vue'
import { poiIcons } from '@/icons'

// Eine Zeile hier = eine Legendenzeile + ein togglebarer Layer in ClimateMap.
// `symbol` bestimmt, wie die Legende das Feature nachmalt:
//   dot   – Punkt mit weißem Ring (Nutzer-Standort)
//   line  – Linienstück (Routen)
//   pin   – nummerierter Kreis (Walk-Standorte)
//   area  – gefüllte Fläche (Polygon-POIs)
//   poi   – weißer Kreis mit blauem Rand + Icon (Punkt-POIs)
// `poiType` = key aus poi_types, koppelt an properties.type aus /api/pois.
export const mapLayers = [
  { key: 'user-location', label: 'Dein Standort', symbol: 'dot' },
  { key: 'walk-route', label: 'Klima-Walk-Route', symbol: 'line' },
  { key: 'walk-location', label: 'Klima-Walk-Standort', symbol: 'pin' },
  { key: 'cooler-ort', label: 'Coole-Orte-Bereich', symbol: 'area', poiType: 'cooler-ort' },
  {
    key: 'trinkbrunnen',
    label: 'Trinkbrunnen',
    symbol: 'poi',
    poiType: 'trinkbrunnen',
    icon: poiIcons.trinkbrunnen,
  },
  {
    key: 'spielplatz',
    label: 'Spielplatz',
    symbol: 'poi',
    poiType: 'spielplatz',
    icon: poiIcons.spielplatz,
  },
  { key: 'wc', label: 'Öffentliches WC', symbol: 'poi', poiType: 'wc', icon: poiIcons.wc },
  {
    key: 'sitzgelegenheit',
    label: 'Sitzgelegenheit',
    symbol: 'poi',
    poiType: 'sitzgelegenheit',
    icon: poiIcons.sitzgelegenheit,
  },
  {
    key: 'erlebnisstandort',
    label: 'Erlebnisstandort',
    symbol: 'poi',
    poiType: 'erlebnisstandort',
    icon: poiIcons.erlebnisstandort,
  },
]

const visible = reactive(Object.fromEntries(mapLayers.map((l) => [l.key, true])))

// POI-Typ -> Legenden-Key. Typen, die (noch) keine Legendenzeile haben, bleiben
// sichtbar — eine neue Zeile in poi_types soll nicht unsichtbar auf der Karte landen.
const keyByPoiType = Object.fromEntries(
  mapLayers.filter((l) => l.poiType).map((l) => [l.poiType, l.key]),
)

// POI-Typen, die gerade ausgeblendet sind (für MapLibre-Filter).
const hiddenPoiTypes = computed(() =>
  mapLayers.filter((l) => l.poiType && !visible[l.key]).map((l) => l.poiType),
)

export function useMapLayers() {
  const isVisible = (key) => visible[key] !== false
  const isPoiVisible = (type) => isVisible(keyByPoiType[type] ?? type)

  return { layers: mapLayers, visible, isVisible, isPoiVisible, hiddenPoiTypes }
}
