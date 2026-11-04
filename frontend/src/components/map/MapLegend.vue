<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useMapLayers } from '@/composables/useMapLayers'

const props = defineProps({
  search: { type: Boolean, default: false },
  nav: { type: Boolean, default: false }, // Nav-Screen: Toggle/Panel unter das HUD schieben
  routeColor: { type: String, default: '' },
})

const showLegend = ref(false)

const { layers, visible } = useMapLayers()

const lineColor = () => props.routeColor || 'var(--c-primary)'
</script>

<template>
  <div
    class="legend-toggle"
    :class="{ 'legend-toggle--search': search, 'legend-toggle--nav': nav }"
  >
    <input type="checkbox" id="legend-toggle" v-model="showLegend" />
    <label for="legend-toggle" class="legend-label">
      <span class="material-symbols-outlined">menu</span>
    </label>
  </div>
  <Transition name="legend-swing">
    <div class="legend" :class="{ 'legend--search': search, 'legend--nav': nav }" v-if="showLegend">
      <h3>Legende</h3>
      <ul>
        <li v-for="layer in layers" :key="layer.key">
          <label :for="`legend-${layer.key}`">
            <span class="sym" :class="`sym--${layer.symbol}`">
              <span v-if="layer.symbol === 'line'" :style="{ background: lineColor() }"></span>
              <span v-else-if="layer.symbol === 'pin'">1</span>
              <AppIcon v-else-if="layer.icon" :name="layer.icon" :size="16" />
            </span>
            <span>{{ layer.label }}</span>
          </label>
          <input type="checkbox" :id="`legend-${layer.key}`" v-model="visible[layer.key]" />
        </li>
      </ul>
    </div>
  </Transition>
  <Transition name="fade">
    <div class="backdrop" v-if="showLegend" @click="showLegend = false"></div>
  </Transition>
</template>

<style scoped>
.legend-toggle {
  position: absolute;
  top: calc(var(--safe-top) + 20px);
  left: var(--sp-lg);
  z-index: 1;

  input[type='checkbox'] {
    display: none;
  }

  label span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    font-size: var(--fs-2xl);
    background: var(--c-primary);
    color: var(--c-white);
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }
}
/* Karten-Tab mit Suchleiste: Toggle unter die Suchleiste schieben */
.legend-toggle--search {
  top: calc(var(--safe-top) + 70px);
}
/* Nav-Screen: Toggle unter das HUD schieben */
.legend-toggle--nav {
  top: calc(var(--safe-top) + 90px);
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-overlay);
}

.legend {
  position: absolute;
  top: var(--safe-top);
  left: 0;
  bottom: 0;
  z-index: calc(var(--z-overlay) + 1);
  width: 90%;
  max-width: clamp(224px, 20vw, 300px);
  height: fit-content;
  overflow-y: auto;
  padding: var(--sp-md);
  background: var(--c-bg);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  box-shadow: var(--shadow-md);

  /* Karten-Tab: erst unter der Suchleiste beginnen */
  &.legend--search {
    top: calc(var(--safe-top) + 120px);
  }
  /* Nav-Screen: unter dem HUD beginnen */
  &.legend--nav {
    top: calc(var(--safe-top) + 120px);
  }

  h3 {
    font-size: var(--fs-md);
    font-weight: var(--fw-bold);
    margin-bottom: var(--sp-sm);
    background: var(--c-primary);
    color: var(--c-white);
    text-align: center;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: var(--sp-xs);

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;

      label {
        display: flex;
        align-items: center;
        gap: var(--sp-sm);
        color: var(--c-primary);
        cursor: pointer;
      }

      input[type='checkbox'] {
        font-size: var(--fs-lg);
        accent-color: var(--c-primary);
        cursor: pointer;
      }
    }
  }
}

/* Legenden icons */
.sym {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

/* Nutzer-Standort */
.sym--dot::before {
  content: '';
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--blue-400);
  border: 3px solid var(--c-white);
  box-shadow: 0 0 4px rgb(0 0 0 / 0.3);
}

/* Route */
.sym--line > span {
  width: 24px;
  height: 4px;
  border-radius: 2px;
}

/* Walk-Standort */
.sym--pin {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--c-white);
}
.sym--pin > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--c-primary);
  border: 2px solid var(--c-white);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
}

/* Coole Orte */
.sym--area::before {
  content: '';
  width: 22px;
  height: 22px;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--green-400) 45%, transparent);
  border: 2px solid var(--green-600);
}

/* Punkt-POIs */
.sym--poi {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--c-bg);
  border: 2px solid var(--c-primary);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
}

.legend-swing-enter-active {
  transition: transform 0.35s cubic-bezier(0.42, 0, 0.58, 1);
}
.legend-swing-leave-active {
  transition: transform 0.25s ease-in;
}
.legend-swing-enter-from,
.legend-swing-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
