const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const etags = new Map()

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) {
    throw new Error(`${res.status} - ${path}`)
  }
  const tag = res.headers.get('etag')
  if (tag) etags.set(path, tag)
  return res.json()
}

/* cache der redaktionellen daten */
const RECHECK_AFTER = 30_000

const cache = new Map()
const checkedAt = new Map()
const listeners = new Map()
const running = new Set()

// Background ETag check
async function revalidate(path) {
  if (running.has(path)) return
  if (Date.now() - (checkedAt.get(path) ?? 0) < RECHECK_AFTER) return
  running.add(path)
  try {
    const tag = etags.get(path)
    const res = await fetch(BASE + path, {
      cache: 'no-cache',
      headers: tag ? { 'If-None-Match': tag } : {},
    })
    checkedAt.set(path, Date.now())
    if (res.status === 304 || !res.ok) return

    const fresh = await res.json()
    const newTag = res.headers.get('etag')
    if (newTag) etags.set(path, newTag)

    const stale = await cache.get(path)
    if (JSON.stringify(stale) === JSON.stringify(fresh)) return
    cache.set(path, Promise.resolve(fresh))
    listeners.get(path)?.forEach((cb) => cb(fresh))
  } catch {
    /* offline oder Serverfehler */
  } finally {
    running.delete(path)
  }
}

function cached(path, onFresh) {
  if (onFresh) {
    if (!listeners.has(path)) listeners.set(path, new Set())
    listeners.get(path).add(onFresh)
  }

  if (cache.has(path)) {
    if (onFresh) revalidate(path)
    return cache.get(path)
  }

  cache.set(
    path,
    get(path).catch((e) => {
      cache.delete(path)
      throw e
    }),
  )
  checkedAt.set(path, Date.now())
  return cache.get(path)
}

export function offFresh(cb) {
  for (const set of listeners.values()) set.delete(cb)
}

export function revalidateAll() {
  for (const [path, set] of listeners) {
    if (set.size) revalidate(path)
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) revalidateAll()
  })
}

export const api = {
  locations: (onFresh) => cached('/locations', onFresh),
  location: (id, onFresh) => cached(`/locations/${id}`, onFresh),
  locationWalks: (id, onFresh) => cached(`/locations/${id}/routes`, onFresh),
  routes: (onFresh) => cached('/routes', onFresh),
  route: (id, onFresh) => cached(`/routes/${id}`, onFresh),
  topics: (onFresh) => cached('/topics', onFresh),
  topic: (id, onFresh) => cached(`/topics/${id}`, onFresh),
  pois: (onFresh) => cached('/pois', onFresh),
  poi: (id, onFresh) => cached(`/pois/${id}`, onFresh),
  warnings: () => get('/warnings'),
}
