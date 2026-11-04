<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { walkIcon as iconFor, walkColor } from '@/icons'

const props = defineProps({
  walk: { type: Object, required: true }, // { id, name, distance_km, category, ... }
})

const accent = computed(() => walkColor(props.walk))
const km = (v) => (v == null ? '' : String(v).replace('.', ',').replace(/,0$/, ''))
</script>

<template>
  <RouterLink class="card-link" :to="`/walk/${walk.id}`">
    <div class="walk-row">
      <span class="badge" :style="{ borderColor: accent, color: accent }">
        <AppIcon :name="iconFor(walk.name)" :size="22" />
      </span>
      <div class="card">
        <span class="name">{{ walk.name }}</span>
        <span class="km">{{ km(walk.distance_km) }} km</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.walk-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}
.card {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  background: var(--c-bg);
  border-radius: var(--r-md);
  font-family: var(--ff-base);

  span {
    padding: var(--sp-lg);
  }
}
.badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--c-primary);
  color: var(--c-primary);
  background: var(--c-bg);
}
.name {
  flex: 1;
  font-family: var(--ff-base);
  font-weight: var(--fw-light);
  font-size: var(--fs-md);
}
.km {
  color: var(--c-text-muted);
  font-weight: var(--fw-light);
  font-size: var(--fs-md);
}
</style>
