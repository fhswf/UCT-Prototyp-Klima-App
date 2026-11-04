import { ref } from 'vue'

const heading = ref(null) // Grad (0 = Norden, im Uhrzeigersinn) | null
const isAvailable = ref(false) // true, sobald ein Event angekommen ist
const error = ref(null)

const THRESHOLD = 5 // Grad

let listener = null
let eventName = 'deviceorientation'
let last = null

function angleDiff(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180)
}

function onOrientation(event) {
  let deg = null

  if (event.webkitCompassHeading != null) {
    // iOS: bereits auf Norden bezogen.
    deg = event.webkitCompassHeading
  } else if (event.alpha != null && (event.absolute || eventName === 'deviceorientationabsolute')) {
    deg = (360 - event.alpha) % 360
  }

  if (deg == null) return

  isAvailable.value = true
  if (last != null && angleDiff(deg, last) < THRESHOLD) return

  last = deg
  heading.value = Math.round(deg)
}

function start() {
  if (listener) return
  eventName =
    'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'
  listener = onOrientation
  window.addEventListener(eventName, listener, false)
}

function stop() {
  if (!listener) return
  window.removeEventListener(eventName, listener, false)
  listener = null
  isAvailable.value = false
  heading.value = null
  last = null
}

async function requestPermission() {
  if (!window.isSecureContext) {
    error.value = 'Kompass braucht HTTPS (oder localhost).'
    console.warn('[deviceHeading]', error.value)
    return false
  }

  const needsPermission = typeof DeviceOrientationEvent?.requestPermission === 'function'
  if (!needsPermission) {
    start() // Android/Desktop: einfach lauschen
    return true
  }

  try {
    const state = await DeviceOrientationEvent.requestPermission()
    if (state !== 'granted') {
      error.value = 'Kompass-Berechtigung abgelehnt.'
      return false
    }
    error.value = null
    start()
    return true
  } catch (e) {
    // Passiert vor allem, wenn der Aufruf nicht aus einer Nutzergeste kam.
    error.value = e.message
    console.warn('[deviceHeading] requestPermission fehlgeschlagen:', e.message)
    return false
  }
}

export function useDeviceHeading() {
  return { heading, isAvailable, error, requestPermission, start, stop }
}
