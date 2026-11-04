<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

// Ein Badge: Ring zeigt den Füllstand, der Kern färbt sich beim Freischalten.
const props = defineProps({
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  icon: { type: String, default: 'kid_star' },
  color: { type: String, default: 'var(--c-primary)' },
  progress: { type: Number, default: 0 }, // 0 … 1
  earned: { type: Boolean, default: false },
  locked: { type: Boolean, default: false }, // Konzept: (noch) nicht erreichbar
  celebrate: { type: Boolean, default: false }, // gerade freigeschaltet -> Animation
  size: { type: Number, default: 76 },
})

defineEmits(['select'])

defineOptions({ inheritAttrs: false })

const R = 30
const CIRC = 2 * Math.PI * R

const clamped = computed(() => Math.min(1, Math.max(0, props.progress || 0)))
const dashoffset = computed(() => CIRC * (1 - (props.earned ? 1 : clamped.value)))
const started = computed(() => !props.locked && clamped.value > 0)
</script>

<template>
  <button
    type="button"
    class="badge"
    :class="{ 'badge--earned': earned, 'badge--locked': locked, 'badge--celebrate': celebrate }"
    :style="{ '--badge-color': color, '--badge-size': `${size}px`, '--badge-circ': CIRC }"
    @click="$emit('select')"
  >
    <span class="disc">
      <svg class="ring" viewBox="0 0 72 72" aria-hidden="true">
        <circle class="track" cx="36" cy="36" :r="R" />
        <circle
          v-if="!locked"
          class="fill"
          cx="36"
          cy="36"
          :r="R"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="dashoffset"
        />
      </svg>
      <span class="core">
        <AppIcon :name="icon" :size="Math.round(size * 0.42)" />
      </span>
      <span v-if="earned" class="chip chip--done material-symbols-outlined">check</span>
      <span v-else-if="locked" class="chip chip--lock material-symbols-outlined">lock</span>
    </span>

    <span v-if="title" class="title">{{ title }}</span>
    <span v-if="caption" class="caption" :class="{ 'caption--active': started }">{{
      caption
    }}</span>
  </button>
</template>

<style scoped>
.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xs) 2px;
  background: none;
  border: none;
  font-family: var(--ff-base);
  color: var(--c-text);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.badge:active .disc {
  transform: scale(0.94);
}

/* Freischalt-Animation: Ring zieht sich zu, Kern springt, Haken setzt sich */
.badge--celebrate .fill {
  animation: ring-draw 0.9s ease-out both;
}
.badge--celebrate .core {
  animation: core-pop 0.6s cubic-bezier(0.2, 1.5, 0.4, 1) 0.35s both;
}
.badge--celebrate .chip--done {
  animation: chip-in 0.35s cubic-bezier(0.2, 1.5, 0.4, 1) 0.75s both;
}

@keyframes ring-draw {
  from {
    stroke-dashoffset: var(--badge-circ);
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes core-pop {
  0% {
    transform: scale(0.7);
  }
  60% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes chip-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .badge--celebrate .fill,
  .badge--celebrate .core,
  .badge--celebrate .chip--done {
    animation: none;
  }
}

.disc {
  position: relative;
  width: var(--badge-size);
  height: var(--badge-size);
  display: grid;
  place-items: center;
  transition: transform 0.15s ease;
}

.ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.track {
  fill: none;
  stroke: var(--c-border);
  stroke-width: 6;
}
.badge--locked .track {
  stroke-dasharray: 5 7;
  stroke-linecap: round;
}
.fill {
  fill: none;
  stroke: var(--badge-color);
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

/* Kern: grau/leer -> getönt (angefangen) -> voll eingefärbt (freigeschaltet) */
.core {
  display: grid;
  place-items: center;
  width: calc(var(--badge-size) - 18px);
  height: calc(var(--badge-size) - 18px);
  border-radius: 50%;
  background: var(--c-bg-subtle);
  color: var(--c-border-strong);
  transition:
    background 0.3s ease,
    color 0.3s ease;
}
.badge--earned .core {
  background: var(--badge-color);
  color: var(--c-white);
}
.badge--locked .core {
  background: var(--c-bg-subtle);
  color: var(--c-border-strong);
  opacity: 0.75;
}

.chip {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  font-size: 15px;
  border-radius: var(--r-pill);
  border: 2px solid var(--c-bg);
}
.chip--done {
  background: var(--c-success);
  color: var(--c-white);
}
.chip--lock {
  background: var(--c-bg);
  color: var(--c-text-muted);
  border-color: var(--c-border);
}

.title {
  max-width: 100%;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: 1.2;
  text-align: center;
  color: var(--c-text);
  overflow-wrap: anywhere;
}
.badge--locked .title {
  color: var(--c-text-muted);
}

.caption {
  font-size: 10px;
  color: var(--c-text-muted);
}
.caption--active {
  color: var(--badge-color);
  font-weight: var(--fw-semibold);
}
</style>
