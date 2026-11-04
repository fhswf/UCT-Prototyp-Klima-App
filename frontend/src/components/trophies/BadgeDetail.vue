<script setup>
import AppModal from '@/components/ui/AppModal.vue'
import BadgeTile from '@/components/trophies/BadgeTile.vue'

defineProps({
  badge: { type: Object, default: null },
})
const emit = defineEmits(['close'])
</script>

<template>
  <AppModal :open="!!badge" @close="emit('close')">
    <div v-if="badge" class="detail">
      <BadgeTile
        :title="''"
        :icon="badge.icon"
        :color="badge.color"
        :progress="badge.progress"
        :earned="badge.earned"
        :locked="badge.locked"
        :size="110"
      />

      <h2>{{ badge.title }}</h2>

      <span class="status" :class="`status--${badge.earned ? 'done' : 'open'}`">
        <span class="material-symbols-outlined">
          {{ badge.earned ? 'check_circle' : 'lock' }}
        </span>
        {{ badge.earned ? 'Freigeschaltet' : 'Noch nicht freigeschaltet' }}
      </span>

      <p class="text">{{ badge.text }}</p>

      <p v-if="badge.tiers" class="tiers">Stufen: {{ badge.tiers }}</p>

      <div class="bar" :style="{ '--badge-color': badge.color }">
        <div
          class="bar-fill"
          :style="{ width: `${Math.round((badge.earned ? 1 : badge.progress) * 100)}%` }"
        />
      </div>
      <p v-if="badge.meta" class="meta">{{ badge.meta }}</p>

      <RouterLink v-if="badge.to" class="link" :to="badge.to" @click="emit('close')">
        {{ badge.linkLabel ?? 'Ansehen' }}
      </RouterLink>
    </div>
  </AppModal>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  text-align: center;
}

h2 {
  font-family: var(--ff-display);
  font-size: var(--fs-lg);
  color: var(--c-primary);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 4px var(--sp-md);
  border-radius: var(--r-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  background: var(--c-bg-subtle);
  color: var(--c-text-muted);
}
.status .material-symbols-outlined {
  font-size: 16px;
}
.status--done {
  background: var(--green-100);
  color: var(--c-success);
}
.status--open {
  background: var(--blue-50);
  color: var(--c-primary);
}

.text {
  font-size: var(--fs-sm);
  color: var(--c-text);
}
.tiers {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

.bar {
  width: 100%;
  height: 8px;
  border-radius: var(--r-pill);
  background: var(--c-border);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: var(--r-pill);
  background: var(--badge-color);
  transition: width 0.5s ease;
}

.meta {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

.link {
  margin-top: var(--sp-sm);
  padding: var(--sp-md) var(--sp-xl);
  border-radius: var(--r-pill);
  background: var(--c-primary);
  color: var(--c-text-on-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}
</style>
