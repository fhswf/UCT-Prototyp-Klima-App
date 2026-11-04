// png-icons
export const bitmapIcons = new Set([
  'baum',
  'buch',
  'erde',
  'gluehbirne',
  'haus',
  'hitze',
  'hund',
  'osthofentor',
  'party',
  'profil',
  'riesenrad',
  'rollator',
  'senior',
  'seniorin',
  'sonne',
  'sterne',
  'stift',
])

export const navIcons = {
  wiki: 'buch',
  routen: 'stift',
  karte: 'erde',
  erfolge: 'party',
  profil: 'profil',
}

export const walkIcons = {
  'Abenteuer Walk': 'abenteuer-walk',
  'Cooler Walk': 'cooler-walk',
  'Historischer Walk': 'historischer-walk',
  'Sanfter Walk': 'sanfter-walk',
  'Walk mit den Kleinsten': 'walk-mit-den-kleinsten',
}

export const walkIcon = (name = '') => {
  if (walkIcons[name]) return walkIcons[name]
  const n = name.toLowerCase()
  if (n.includes('abenteuer')) return 'abenteuer-walk'
  if (n.includes('cool')) return 'cooler-walk'
  if (n.includes('histor')) return 'historischer-walk'
  if (n.includes('sanft')) return 'sanfter-walk'
  if (n.includes('kleinst')) return 'walk-mit-den-kleinsten'
  return 'schuh'
}

// Walk-Kategorie (key aus walk_categories) -> Akzentfarbe für Karten/Badges.
export const walkColors = {
  'abenteuer-walk': '#e8930c', // Amber – Abenteuer
  'cooler-walk': '#1f88c4', // Blau – Cool
  'historischer-walk': '#8a6d3b', // Braun – Historisch
  'sanfter-walk': '#6f9d2c', // Grün – Sanft
  'walk-mit-den-kleinsten': '#d6336c', // Pink – Kleinste
}

export const walkColor = (route) => {
  const key = route?.category?.key
  if (key && walkColors[key]) return walkColors[key]
  return walkColors[walkIcon(route?.name ?? '')] ?? 'var(--c-primary)'
}

// POI-Typ -> Karten-/Legenden-Icon
export const poiIcons = {
  trinkbrunnen: 'poi-trinkbrunnen',
  sitzgelegenheit: 'poi-sitzgelegenheit',
  spielplatz: 'poi-spielplatz',
  wc: 'poi-wc',
  erlebnisstandort: 'poi-erlebnisstandort',
}
