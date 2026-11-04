<script setup>
import ClimateMap from '@/components/map/ClimateMap.vue'
import WalkCard from '@/components/cards/WalkCard.vue'

defineProps({
  walks: { type: Array, default: () => [] },
  routes: { type: Object, default: null },
  locations: { type: Array, default: () => [] },
  activeId: { type: [Number, String], default: null },
})
</script>

<template>
  <div class="klima-walk">
    <div class="map-box">
      <ClimateMap :routes="routes" :locations="locations" :active-id="activeId" focus="location" />
    </div>

    <div v-if="!walks.length" class="empty">
      <span class="material-symbols-outlined">wrong_location</span>
      <p class="empty-title">Kein Klima-Walk an diesem Standort</p>
      <p class="empty-text">Dieser Standort ist aktuell in keiner Route enthalten.</p>
    </div>

    <template v-else>
      <h3 class="list-title">Alle Klima-Walks mit diesem Standort:</h3>

      <ul class="walk-list">
        <WalkCard v-for="w in walks" :key="w.id" :walk="w" />
      </ul>
    </template>
  </div>
</template>

<style scoped>
.klima-walk {
  background: var(--c-bg-secondary);
  padding-bottom: var(--sp-lg);
}
.map-box {
  height: 300px;
}
.list-title {
  text-align: center;
  color: var(--c-primary);
  font-family: var(--ff-base);
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  padding: var(--sp-lg);
  margin: var(--sp-xl) 0;
}
.walk-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: 0 var(--sp-lg);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-sm);
  padding: calc(var(--sp-xl) * 2) var(--sp-lg);
  color: var(--c-text-muted);
}
.empty .material-symbols-outlined {
  font-size: 3rem;
  color: var(--c-primary);
}
.empty-title {
  font-family: var(--ff-base);
  font-weight: var(--fw-bold);
  color: var(--c-primary);
}
</style>
