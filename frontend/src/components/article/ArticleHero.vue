<script setup>
import FavHeart from '@/components/ui/FavHeart.vue'
import AppIcon from '@/components/AppIcon.vue'
import { walkIcon } from '@/icons'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  theme: { type: String, default: 'standort' },
  fav: { type: Boolean, default: false },
  walkName: { type: String, default: '' },

  // Routenmodus: Pfeile zum vorherigen/nächsten Standort der Route
  showNav: { type: Boolean, default: false },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
})
defineEmits(['back', 'update:fav', 'prev', 'next'])
</script>

<template>
  <header
    class="hero"
    :class="`hero--${theme}`"
    :style="image ? { backgroundImage: `url(${image})` } : {}"
    v-bg-fallback="image"
  >
    <div class="controls">
      <span class="material-symbols-outlined" @click="$emit('back')">arrow_back</span>
      <div class="controls-right">
        <AppIcon v-if="theme === 'walk'" :name="walkIcon(walkName)" class="walk-icon" :size="32" />
        <FavHeart :model-value="fav" @update:model-value="$emit('update:fav')" />
      </div>
    </div>
    <!-- Titelband -->
    <div class="hero-text" :class="{ 'hero-text--nav': showNav }">
      <!-- Pfeile in Routenmodus -->
      <button
        v-if="showNav"
        class="nav-arrow material-symbols-outlined"
        :disabled="!hasPrev"
        aria-label="Vorheriger Standort"
        @click="$emit('prev')"
      >
        chevron_left
      </button>

      <div class="hero-titles">
        <div class="hero-title-row">
          <AppIcon
            v-if="theme === 'walk'"
            :name="walkIcon(walkName)"
            class="walk-icon"
            :size="32"
          />
          <h1 class="hero-title">{{ title }}</h1>
        </div>
        <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
      </div>

      <button
        v-if="showNav"
        class="nav-arrow material-symbols-outlined"
        :disabled="!hasNext"
        aria-label="Nächster Standort"
        @click="$emit('next')"
      >
        chevron_right
      </button>
    </div>
  </header>
</template>

<style scoped>
.hero {
  /*   position: sticky;*/
  top: 0;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-color: var(--c-bg-subtle);
  height: calc(250px + var(--safe-top));
  z-index: 2;

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: calc(var(--safe-top) + var(--sp-xl)) var(--sp-lg) var(--sp-xl);

    & > span {
      font-size: var(--fs-xl);
      color: var(--c-white);
    }

    cursor: pointer;
  }

  .controls > span,
  .controls :deep(.fav) {
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  }

  .controls-right {
    display: flex;
    align-items: center;
    gap: var(--sp-md);
  }

  .hero-text {
    position: relative;
    width: 100%;
    top: 96px;
    padding: var(--sp-md);
    text-align: center;
    font-family: var(--ff-display);
    color: var(--c-primary);
    background-color: var(--c-bg-primary);
    line-height: 1.2;

    /* Routenmodus: Pfeile links/rechts */
    &.hero-text--nav {
      display: flex;
      align-items: center;
      gap: var(--sp-sm);
    }

    .hero-titles {
      flex: 1;
      min-width: 0;
    }

    .hero-title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-sm);
    }

    h1 {
      font-weight: var(--fw-semibold);
      font-size: var(--fs-lg);
    }

    p {
      font-weight: var(--fw-regular);
      font-size: var(--fs-sm);
    }
  }
}

.walk-icon {
  color: var(--c-primary);
  background-color: var(--c-bg);
  border-radius: 50%;
}

.controls .walk-icon {
  color: var(--c-primary);
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.55));
}

/* Routen-Pfeile im Titelband */
.nav-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--c-primary);
  font-size: var(--fs-2xl);
  cursor: pointer;
}
.nav-arrow:disabled {
  opacity: 0.25;
  pointer-events: none;
}

/* Walk-Variante: grünes Titelband statt blau */
.hero--walk .hero-text {
  background-color: var(--c-bg-secondary);
}
</style>
