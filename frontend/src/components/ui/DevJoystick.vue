<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useDevLocation } from '@/composables/useDevLocation'

// Dev-Joystick außerhalb des Smartphones: bewegt den simulierten Standort.
// Erscheint erst, wenn der Dev-Modus aktiv ist (devLocation.enable() in der
// Konsole)
const isDev = import.meta.env.DEV
const { enabled, disable, nudge } = useDevLocation()

const RADIUS = 42
const TICK_MS = 90
const SPEED = 0.25

const baseEl = ref(null)
const knob = ref({ x: 0, y: 0 })
let dragging = false
let timer = null
let angle = 0
let magnitude = 0

function startTick() {
  if (timer) return
  timer = setInterval(() => {
    if (magnitude > 0.05) nudge(angle, magnitude * SPEED)
  }, TICK_MS)
}
function stopTick() {
  clearInterval(timer)
  timer = null
}

function update(e) {
  const rect = baseEl.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  let dx = e.clientX - cx
  let dy = e.clientY - cy
  const dist = Math.hypot(dx, dy)
  const clamped = Math.min(dist, RADIUS)
  if (dist > 0) {
    dx = (dx / dist) * clamped
    dy = (dy / dist) * clamped
  }
  knob.value = { x: dx, y: dy }
  magnitude = clamped / RADIUS
  // Winkel: 0 = Norden (oben), im Uhrzeigersinn. Screen-dy zeigt nach unten.
  angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
}

function onDown(e) {
  dragging = true
  e.target.setPointerCapture?.(e.pointerId)
  update(e)
  startTick()
}
function onMove(e) {
  if (dragging) update(e)
}
function onUp() {
  dragging = false
  knob.value = { x: 0, y: 0 }
  magnitude = 0
  stopTick()
}

onBeforeUnmount(stopTick)
</script>

<template>
  <div v-if="isDev && enabled" class="dev-joystick">
    <button class="power on" @click="disable">GPS-Sim beenden</button>
    <div
      ref="baseEl"
      class="base active"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <div class="knob" :style="{ transform: `translate(${knob.x}px, ${knob.y}px)` }" />
    </div>
  </div>
</template>

<style scoped>
.dev-joystick {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  user-select: none;
  touch-action: none;
}

.power {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  background: var(--gray-300);
  color: var(--gray-700);
  cursor: pointer;
}
.power.on {
  background: var(--c-primary);
  color: var(--c-white);
}

.base {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(0, 0, 0, 0.25);
  cursor: grab;
}
.base.active {
  background: rgba(4, 40, 163, 0.12);
  border-color: var(--c-primary);
}
.base:active {
  cursor: grabbing;
}

.knob {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  border-radius: 50%;
  background: var(--c-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
</style>
