<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from '../AppIcon.vue'

defineProps({
  poi: { type: Object, default: null },
})

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

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="slide-up">
      <div v-if="poi" class="poi-sheet">
        <button class="close-x" @click="emit('close')" aria-label="Schließen">
          <span class="material-symbols-outlined">close</span>
        </button>

        <img
          v-if="poi.properties.image_url"
          :src="poi.properties.image_url"
          alt=""
          class="poi-img"
        />

        <div class="poi-body">
          <div class="poi-header">
            <p class="poi-type">{{ poi.properties.type_name }}</p>
            <h2 class="poi-name">{{ poi.properties.name }}</h2>
          </div>
          <div class="adress">
            <p>Soest, Nordrhein-Westfalen, Deutschland</p>
            <p v-if="poi.properties.address" class="poi-address">{{ poi.properties.address }}</p>
          </div>
          <p v-if="poi.properties.description" class="poi-desc">{{ poi.properties.description }}</p>
          <p id="datetime">{{ dateText }}</p>
          <p class="temp-line">
            <AppIcon name="temperatur" size="24" />
            Aktuelle Lufttemperatur: <strong>26°C</strong>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.poi-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-sheet);
  background: var(--c-bg);
  border-radius: var(--r-lg) var(--r-lg) 0 0;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  padding-bottom: var(--sp-xl);
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

.close-x {
  position: absolute;
  top: var(--sp-md);
  right: var(--sp-md);
  z-index: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  color: var(--c-text);
  cursor: pointer;
}

.poi-img {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.poi-body {
  padding: var(--sp-lg);
}
.poi-type {
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.poi-name {
  margin: var(--sp-xs) 0 var(--sp-sm);
  color: var(--c-primary);
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
}
.poi-address {
  margin-bottom: var(--sp-sm);
  color: var(--c-text-muted);
}
.poi-desc {
  line-height: 1.5;
}

.temp-line {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  margin-top: var(--sp-md);
  color: var(--c-primary);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
