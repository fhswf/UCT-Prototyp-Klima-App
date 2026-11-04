<script setup>
import { computed } from 'vue'
import FavHeart from '@/components/ui/FavHeart.vue'

const props = defineProps({
  location: { type: Object, required: true },
  fav: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
})
const emit = defineEmits(['toggle-fav'])

const target = computed(() => props.to ?? `/standort/${props.location.id}`)

const number = computed(() => props.location.station_number ?? props.location.id)
</script>

<template>
  <li class="row">
    <RouterLink class="card-link" :to="target">
      <div class="card">
        <div class="card-text">
          <span class="label">Standort {{ number }}: </span>
          <strong>{{ location.name }}</strong>
        </div>
      </div>
    </RouterLink>

    <FavHeart :model-value="fav" @update:model-value="emit('toggle-fav')" />
  </li>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-md);
}

.card-link {
  flex: 1 1 0;
}

.card {
  background: var(--c-bg);
  border-radius: var(--r-card);
  padding: 12px 18px;
  cursor: pointer;

  .card-text {
    font-weight: var(--fw-light);
    line-height: 26px;

    strong {
      font-weight: var(--fw-bold);
    }
  }
}
.card .label {
  color: var(--c-text-muted);
}
.card .away {
  display: block;
  color: var(--c-text-muted);
  font-size: var(--fs-xs);
  line-height: 1.2;
}
</style>
