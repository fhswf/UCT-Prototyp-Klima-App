// Geo-Helfer für Karte & Navigation. Alle Punkte als [lng, lat].

const R = 6371000 // Erdradius (m)
const toRad = (d) => (d * Math.PI) / 180
const toDeg = (r) => (r * 180) / Math.PI

// Luftlinie in Metern (Haversine).
export function haversine([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Luftlinie zum nächstgelegenen Punkt einer Liste (m). Leere Liste -> null.
export function nearestDistance(pt, points) {
  let best = null
  for (const p of points ?? []) {
    if (!p) continue
    const d = haversine(pt, p)
    if (best == null || d < best) best = d
  }
  return best
}

// Entfernung für die Anzeige: unter 1 km in 10-m-Schritten, darüber in km.
export function formatDistance(m) {
  if (m == null || !Number.isFinite(m)) return ''
  if (m < 1000) return `${Math.round(m / 10) * 10} m`
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`
}

// Kurs (0° = Norden, im Uhrzeigersinn) von einem Punkt zum nächsten.
export function bearing([lng1, lat1], [lng2, lat2]) {
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// Lokale Meter-Projektion (equirectangular) um einen Referenzpunkt.
function toXY([lng, lat], [lng0, lat0]) {
  return [toRad(lng - lng0) * Math.cos(toRad(lat0)) * R, toRad(lat - lat0) * R]
}

// Nächster Punkt auf einer Polylinie zu pt.
// Liefert { dist, along, index, t }: Abstand zur Linie (m), zurückgelegte
// Strecke bis dorthin (m), Segmentindex und Anteil t im Segment [0..1].
export function nearestOnLine(line, pt) {
  if (!line?.length) return null
  const ref = line[0]
  const P = toXY(pt, ref)
  let best = { dist: Infinity, along: 0, index: 0, t: 0 }
  let acc = 0
  for (let i = 0; i < line.length - 1; i++) {
    const A = toXY(line[i], ref)
    const B = toXY(line[i + 1], ref)
    const dx = B[0] - A[0]
    const dy = B[1] - A[1]
    const segLen = Math.hypot(dx, dy)
    let t = segLen === 0 ? 0 : ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / (segLen * segLen)
    t = Math.max(0, Math.min(1, t))
    const px = A[0] + t * dx
    const py = A[1] + t * dy
    const d = Math.hypot(P[0] - px, P[1] - py)
    if (d < best.dist) best = { dist: d, along: acc + t * segLen, index: i, t }
    acc += segLen
  }
  return best
}

// Strecke ENTLANG der Linie zwischen den Projektionen zweier Punkte (m).
// Das ist die "echte" Distanz über den Weg, nicht die Luftlinie.
export function distanceAlong(line, from, to) {
  const a = nearestOnLine(line, from)
  const b = nearestOnLine(line, to)
  if (!a || !b) return null
  return Math.abs(b.along - a.along)
}

// Liegt pt innerhalb des Rings? Ray-Casting in Grad – für die kleinen
// Coole-Orte-Polygone genau genug (Verzerrung spielt auf ~100 m keine Rolle).
function inRing([lng, lat], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Alle Stützpunkte einer GeoJSON-Geometrie flach als [lng, lat]-Liste.
function coordsOf(geometry) {
  const out = []
  const walk = (c) => (typeof c[0] === 'number' ? out.push(c) : c.forEach(walk))
  if (geometry?.coordinates) walk(geometry.coordinates)
  return out
}

// Kürzeste Entfernung von pt zu einer beliebigen GeoJSON-Geometrie (m).
// Punkte/Linien: nächster Stützpunkt. Flächen: 0, wenn pt darin liegt,
// sonst der nächste Randpunkt. Reicht für Radius-Filter (POIs in der Nähe).
export function distanceToGeometry(pt, geometry) {
  if (!geometry) return null
  const polys =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : []
  for (const rings of polys) {
    if (rings[0] && inRing(pt, rings[0])) return 0
  }
  return nearestDistance(pt, coordsOf(geometry))
}

// Teil der Linie ab der Projektion von fromPt bis zum Ende, inkl. exaktem
// Startpunkt auf der Linie. Für die "Reststrecke"-Hervorhebung.
export function sliceFrom(line, fromPt) {
  const snap = nearestOnLine(line, fromPt)
  if (!snap) return line
  const A = line[snap.index]
  const B = line[snap.index + 1] ?? A
  const start = [A[0] + snap.t * (B[0] - A[0]), A[1] + snap.t * (B[1] - A[1])]
  return [start, ...line.slice(snap.index + 1)]
}
