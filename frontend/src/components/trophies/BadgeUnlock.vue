<script setup>
import { computed } from 'vue'
import BadgeTile from '@/components/trophies/BadgeTile.vue'
import AppButton from '@/components/ui/AppButton.vue'

// Abschluss eines Walks: Badge fliegt auf, Ring füllt sich, Konfetti
const props = defineProps({
  open: { type: Boolean, default: false },
  badge: { type: Object, default: null }, // { title, icon, color }
  subtitle: { type: String, default: '' },
  kicker: { type: String, default: 'Erfolg freigeschaltet' },
  action: { type: String, default: 'Zu meinen Erfolgen' },
})
const emit = defineEmits(['close'])

const PIECES = 14
const COLORS = ['var(--c-accent)', 'var(--c-secondary)', 'var(--c-primary)', '#e8930c']

const confetti = computed(() =>
  Array.from({ length: PIECES }, (_, i) => {
    const angle = (360 / PIECES) * i
    return {
      '--angle': `${angle}deg`,
      '--distance': `${90 + (i % 4) * 18}px`,
      '--spin': `${(i % 2 ? 1 : -1) * 240}deg`,
      '--delay': `${0.35 + (i % 5) * 0.05}s`,
      background: COLORS[i % COLORS.length],
    }
  }),
)
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="unlock">
      <div v-if="open && badge" class="unlock">
        <div class="card">
          <div class="stage">
            <span class="rays" :style="{ '--badge-color': badge.color }" />
            <span v-for="(style, i) in confetti" :key="i" class="confetti" :style="style" />
            <BadgeTile
              :icon="badge.icon"
              :color="badge.color"
              :progress="1"
              earned
              celebrate
              :size="120"
            />
          </div>

          <p class="kicker">{{ kicker }}</p>
          <h2>{{ badge.title }}</h2>
          <p v-if="subtitle" class="sub">{{ subtitle }}</p>

          <AppButton @click="emit('close')">{{ props.action }}</AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.unlock {
  position: absolute;
  inset: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-xl);
  background: var(--c-overlay);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  width: 100%;
  padding: var(--sp-xl);
  text-align: center;
  background: var(--c-bg);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
  animation: card-in 0.45s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

/* Bühne für Badge + Strahlen + Konfetti */
.stage {
  position: relative;
  display: grid;
  place-items: center;
  margin-bottom: var(--sp-sm);
}

.rays {
  position: absolute;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--badge-color) 0 6deg,
    transparent 6deg 30deg,
    var(--badge-color) 30deg 36deg,
    transparent 36deg 60deg
  );
  mask: radial-gradient(circle, transparent 46%, #000 48%, #000 70%, transparent 72%);
  -webkit-mask: radial-gradient(circle, transparent 46%, #000 48%, #000 70%, transparent 72%);
  opacity: 0;
  animation: rays-burst 1.2s ease-out 0.25s both;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 12px;
  border-radius: 2px;
  opacity: 0;
  animation: confetti-fly 1.1s ease-out var(--delay) both;
}

.kicker {
  font-family: var(--ff-display);
  font-size: var(--fs-sm);
  letter-spacing: 0.04em;
  color: var(--c-text-muted);
}
h2 {
  font-family: var(--ff-display);
  font-size: var(--fs-lg);
  color: var(--c-primary);
}
.sub {
  margin-bottom: var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes rays-burst {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  35% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
    transform: scale(1.15) rotate(45deg);
  }
}

@keyframes confetti-fly {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(0) rotate(0deg);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(calc(var(--distance) * -1)) rotate(var(--spin));
  }
}

.unlock-enter-active,
.unlock-leave-active {
  transition: opacity 0.25s ease;
}
.unlock-enter-from,
.unlock-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .rays,
  .confetti {
    animation: none;
  }
  .rays,
  .confetti {
    display: none;
  }
}
</style>
