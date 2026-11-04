<script setup>
import { ref, computed } from 'vue'
import InfoWidget from './InfoWidget.vue'
import AppIcon from '@/components/AppIcon.vue'
import { infoCard } from '@/data/infoCard'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  hasSensor: { type: Boolean, default: false } /* Messstation am Standort */,
})

const open = ref(true)
const active = ref(null)
const activeCategory = computed(
  () => props.categories.find((c) => c.key === active.value) ?? props.categories[0] ?? null,
)

const catIcon = (cat) =>
  cat.iconSensor ? (props.hasSensor ? cat.iconSensor : cat.iconKi) : cat.icon

const notice = computed(() => {
  const info = activeCategory.value?.info
  if (!info) return ''
  return props.hasSensor ? info.noticeSensor : info.noticeKi
})

const helpStat = ref(null)
const helpCard = computed(() => infoCard.find((c) => c.key === helpStat.value?.key) ?? null)
</script>

<template>
  <div class="climate-widget">
    <div class="header" @click="open = !open">
      <span class="material-symbols-outlined" :class="{ active: open }">keyboard_arrow_down</span>
      <h2>Lokale Klimainformationen</h2>
    </div>

    <div class="content-wrap" :class="{ open }">
      <div class="content">
        <div class="cat-tabs">
          <button
            v-for="cat in categories"
            :key="cat.key"
            class="cat-tab"
            :class="{ active: cat.key === activeCategory?.key, uct: cat.key === 'uct' }"
            @click="active = cat.key"
          >
            <AppIcon :name="catIcon(cat)" class="cat-icon" :size="26" />
            {{ cat.label }}
          </button>
        </div>

        <div class="stats">
          <!-- Info-Kategorie -->
          <ul v-if="activeCategory?.info" class="stat-tab info-tab">
            <li class="stat-row uct">
              <div class="card-wrapper">
                <div class="heading">
                  <span class="material-symbols-outlined">data_exploration</span>
                  <h2>{{ activeCategory.info.title }}</h2>
                </div>
                <p>
                  {{ activeCategory.info.text }} <strong>{{ notice }}</strong>
                </p>
                <a :href="activeCategory.info.link" target="_blank" rel="noopener noreferrer">
                  <span class="material-symbols-outlined">link_2</span>
                  <p>Hier geht’s zum Dashboard mit weiteren Infos</p>
                </a>
              </div>
            </li>
          </ul>

          <!-- Normale Stat-Kategorie -->
          <ul v-else class="stat-tab">
            <li v-for="(stat, i) in activeCategory?.stats" :key="i" class="stat-row">
              <AppIcon :name="stat.icon" :size="24" />
              <div class="data" :class="{ green: stat.highlighted }">
                <p>{{ stat.label }}:</p>
                <span>{{ stat.value }}</span>
              </div>
              <span class="material-symbols-outlined help" @click="helpStat = stat">help</span>
            </li>
          </ul>
        </div>
        <InfoWidget
          :open="!!helpStat"
          :title="helpCard?.title"
          :text="helpCard?.text"
          @close="helpStat = null"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.climate-widget {
  background-color: var(--c-bg-primary);

  .header {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    padding: var(--sp-md) var(--sp-lg);
    border-bottom: 1px solid var(--c-border);
    color: var(--c-primary);

    span {
      font-size: 40px;
      cursor: pointer;

      &.active {
        transform: rotate(180deg);
        transition: transform 0.3s ease;
      }
    }

    h2 {
      font-family: var(--ff-display);
      font-size: var(--fs-lg);
      font-weight: var(--fw-regular);
    }
  }
}

.content-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.content-wrap.open {
  grid-template-rows: 1fr;
}
.content {
  overflow: hidden;
  min-height: 0;
}

.cat-tabs {
  display: flex;
  background: var(--c-bg);
}
.cat-tab {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-sm) var(--sp-xs);
  border: none;
  background: none;
  color: var(--c-primary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}
.cat-tab .cat-icon {
  transition: transform 0.1s ease;
}
.cat-tab:active .cat-icon {
  transform: scale(0.85);
}
.cat-tab.uct {
  color: var(--green-500);
}
.cat-tab.active {
  color: var(--c-accent);
}

.cat-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid var(--c-bg-primary);
}

.cat-tab.active.uct::after {
  border-bottom-color: var(--c-bg-secondary);
}

button.cat-tab {
  font-family: var(--ff-base);
  font-weight: var(--fw-semibold);
}

.stats {
  min-height: 10rem;
  display: flex;
  flex-direction: column;
}

.stat-tab.info-tab {
  flex: 1;
  padding: 0;
}
.info-tab .stat-row.uct {
  flex: 1;
}

.stat-tab {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-xl);
  min-height: 10.6rem;

  .stat-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-sm);
    font-size: var(--fs-sm);

    .data {
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      gap: var(--sp-xs);
      width: 100%;
      padding: var(--sp-xs) var(--sp-sm);
      border-radius: var(--r-sm);
      background-color: var(--c-bg);

      p {
        font-weight: var(--fw-regular);
        color: var(--c-text);
      }

      span {
        font-weight: var(--fw-semibold);
      }

      &.green {
        background-color: var(--c-bg-secondary);
      }
    }

    &.uct {
      background-color: var(--c-bg-secondary);
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      padding: var(--sp-lg) var(--sp-sm);

      .card-wrapper {
        background-color: var(--c-bg);
        padding: var(--sp-sm);
        border-radius: var(--r-md);
        border: 1px solid var(--c-primary);
      }

      .heading {
        position: absolute;
        right: 36px;
        top: 0px;
        display: flex;
        align-items: center;
        gap: var(--sp-sm);
        margin-bottom: var(--sp-sm);

        &::after {
          content: '';
          position: absolute;
          top: 4px;
          left: -10px;
          width: calc(100% + 20px);
          height: 33%;
          background-color: var(--c-bg-secondary);
          z-index: 1;
        }

        h2 {
          font-size: var(--fs-lg);
          font-weight: var(--fw-semibold);
          color: var(--c-primary);
          z-index: 2;
        }

        span {
          font-size: var(--fs-xl);
          color: var(--c-primary);
          z-index: 2;
        }
      }

      p {
        font-size: var(--fs-sm);
        font-weight: var(--fw-regular);
        line-height: 18px;
        letter-spacing: 0%;
        margin-top: var(--sp-xs);
        margin-bottom: var(--sp-xs);
      }

      a {
        display: flex;
        align-items: center;
        gap: var(--sp-xs);
        color: var(--c-accent);
        text-decoration: none;
        font-size: var(--fs-sm);
        font-weight: var(--fw-semibold);

        span.material-symbols-outlined {
          font-size: var(--fs-md);
        }

        p {
          text-decoration: underline;
        }
      }
    }
  }
}

.help {
  cursor: pointer;
  color: var(--c-primary);
}
</style>
