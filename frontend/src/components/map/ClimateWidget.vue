<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { climateCategories } from '@/data/climateCategories'
import { infoCard } from '@/data/infoCard'
import InfoWidget from '@/components/article/InfoWidget.vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  location: { type: Object, default: null },
})
defineEmits(['close'])

const categories = climateCategories
const active = ref('temp')
const activeCategory = computed(
  () => categories.find((c) => c.key === active.value) ?? categories[0],
)

const catIcon = (cat) => (cat.iconSensor ? cat.iconKi : cat.icon)

// Hilfe-Popup
const helpStat = ref(null)
const helpCard = computed(() => infoCard.find((c) => c.key === helpStat.value?.key) ?? null)

// Kopf-Infos aus der Location
const coords = computed(() => props.location?.location?.coordinates ?? null)
const coordText = computed(() =>
  coords.value ? `${coords.value[1].toFixed(6)}, ${coords.value[0].toFixed(6)}` : '',
)
// Uhrzeit
const now = ref(new Date())
let clockTimer
onMounted(() => {
  clockTimer = setInterval(() => (now.value = new Date()), 30_000)
})
onBeforeUnmount(() => clearInterval(clockTimer))

const dateText = computed(
  () =>
    now.value.toLocaleString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' Uhr',
)
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="climate">
      <div v-if="open" class="overlay" @click.self="$emit('close')">
        <div class="panel">
          <main class="content-area" :class="{ 'is-uct': activeCategory?.info }">
            <div class="content-header">
              <div class="row">
                <AppIcon class="material-symbols-outlined pin" name="location_on" />
                <div class="location-info">
                  <h1 class="location">{{ location?.name }}</h1>
                  <p class="location-description">Soest, Nordrhein-Westfalen, Deutschland</p>
                  <p class="coords">{{ coordText }}</p>
                  <p class="timedate">{{ dateText }}</p>
                </div>
              </div>
              <p class="temp-line">
                <AppIcon name="temperatur" size="24" />
                Aktuelle Lufttemperatur: <strong>26°C</strong>
              </p>
            </div>

            <!-- Info-Kategorie (UCT) -->
            <div v-if="activeCategory?.info" class="uct-wrapper">
              <div class="uct-card">
                <h2>{{ activeCategory.info.title }}</h2>
                <p>{{ activeCategory.info.text }}</p>
                <a :href="activeCategory.info.link" target="_blank" rel="noopener noreferrer">
                  <span class="material-symbols-outlined">link_2</span>
                  Hier geht’s zum Dashboard mit weiteren Infos
                </a>
              </div>
            </div>

            <!-- Normale Stats -->
            <ul v-else class="stat-list">
              <li v-for="(stat, i) in activeCategory?.stats" :key="i" class="stat-row">
                <AppIcon :name="stat.icon" :size="24" />
                <div class="data" :class="{ green: stat.highlighted }">
                  <p>{{ stat.label }}</p>
                  <span>{{ stat.value }}</span>
                </div>
                <span class="material-symbols-outlined help" @click="helpStat = stat">help</span>
              </li>
            </ul>

            <div class="content-footer">
              <AppButton @click="$emit('close')">Schließen</AppButton>
            </div>
          </main>

          <aside class="side-tabbar">
            <button
              v-for="cat in categories"
              :key="cat.key"
              class="tab-item"
              :class="{ active: cat.key === active, uct: cat.key === 'uct' }"
              @click="active = cat.key"
            >
              <AppIcon :name="catIcon(cat)" :size="26" />
              {{ cat.label }}
            </button>
          </aside>
        </div>

        <InfoWidget
          :open="!!helpStat"
          :title="helpCard?.title"
          :text="helpCard?.text"
          @close="helpStat = null"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.overlay {
  position: absolute;
  inset: 0;
  background: var(--c-overlay);
  display: flex;
  justify-content: flex-end;
  z-index: var(--z-overlay);
}

.panel {
  position: relative;
  top: calc(var(--safe-top) + 14px);
  display: flex;
  width: calc(100% - 12px);
  height: clamp(600px, 80vh, 720px);
  box-shadow: var(--shadow-md);
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--c-bg-primary);
  overflow-y: auto;
  border-radius: var(--r-lg) 0 0 var(--r-lg);

  &.is-uct {
    background: var(--c-bg-secondary);
  }
}

.content-header {
  padding: var(--sp-xl) var(--sp-lg) var(--sp-md);

  .row {
    display: flex;
    gap: var(--sp-sm);
  }
  .pin {
    color: var(--c-accent);
  }
}

.location-info {
  font-size: var(--fs-sm);
  font-family: var(--ff-base);
  color: var(--c-text);

  .location {
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
    margin-bottom: var(--sp-xs);
  }
  .coords {
    color: var(--c-primary);
    font-weight: var(--fw-semibold);
    margin-bottom: var(--sp-xs);
  }
  .timedate {
    margin-top: var(--sp-xs);
  }
}

.temp-line {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  margin-top: var(--sp-md);
  color: var(--c-primary);
}

/* Stats */
.stat-list {
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
}
.stat-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: var(--fs-sm);

  .data {
    flex: 1;
    display: flex;
    justify-content: space-between;
    gap: var(--sp-sm);
    padding: var(--sp-xs) var(--sp-sm);
    border-radius: var(--r-sm);
    background: var(--c-bg);
    max-width: 204px;

    p {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .data.green {
    background: var(--c-bg-secondary);
  }
  .data span {
    font-weight: var(--fw-semibold);
  }
  .help {
    color: var(--c-primary);
    cursor: pointer;
  }
}

/* UCT-Card */
.uct-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-lg) var(--sp-sm);
  flex: 1;
}

.uct-card {
  padding: var(--sp-md);
  background: var(--c-bg);
  border: 1px solid var(--c-primary);
  border-radius: var(--r-md);
  height: fit-content;

  h2 {
    color: var(--c-primary);
    font-size: var(--fs-lg);
    margin-bottom: var(--sp-sm);
  }
  p {
    font-size: var(--fs-sm);
    line-height: 1.4;
  }
  a {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    margin-top: var(--sp-md);
    font-size: var(--fs-sm);
    color: var(--c-accent);
    text-decoration: underline;

    span {
      text-decoration: none;
    }
  }
}

/* Close Button */
.content-footer {
  padding: 24px 16px;
}

/* Tabbar */
.side-tabbar {
  width: 72px;
  flex-shrink: 0;
  background: var(--c-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: var(--sp-xl) var(--sp-xs);

  button {
    border: none;
    background: none;
    cursor: pointer;
    letter-spacing: -0.7px;
    font-family: var(--ff-display);
    width: 100%;
    padding: 8px 4px;
  }
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  cursor: pointer;

  .material-symbols-outlined {
    font-size: var(--fs-xl);
  }
  &.uct {
    color: var(--green-500);
  }
  &.active {
    color: var(--c-accent);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 4px;
      transform: translate(-100%, -50%);
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 8px solid var(--c-bg-primary);
    }
  }
  &.active.uct::after {
    border-left-color: var(--c-bg-secondary);
  }
}

/* Animate */
.climate-enter-active,
.climate-leave-active {
  transition: opacity 0.3s ease;
}
.climate-enter-from,
.climate-leave-to {
  opacity: 0;
}
.climate-enter-active .panel,
.climate-leave-active .panel {
  transition: transform 0.3s ease;
}
.climate-enter-from .panel,
.climate-leave-to .panel {
  transform: translateX(100%);
}
</style>
