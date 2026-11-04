<script setup>
import { computed } from 'vue'
import FavHeart from '@/components/ui/FavHeart.vue'
import AppIcon from '@/components/AppIcon.vue'
import { walkIcon as iconFor, walkColor } from '@/icons'
import { formatDistance } from '@/lib/geo'

const props = defineProps({
  route: { type: Object, required: true },
  fav: { type: Boolean, default: false },
})
defineEmits(['toggle-fav'])

const accent = computed(() => walkColor(props.route))

const away = computed(() => formatDistance(props.route.distance_m))
</script>

<template>
  <RouterLink class="card-link" :to="`/walk/${route.id}`">
    <li
      class="card"
      :style="{ backgroundImage: `url(${route.thumbnail_url})` }"
      v-bg-fallback="route.thumbnail_url"
    >
      <div class="controls">
        <AppIcon
          :name="iconFor(route.name)"
          class="walk-icon"
          :size="30"
          :style="{ borderColor: accent, color: accent }"
        />
        <FavHeart :model-value="fav" @update:model-value="$emit('toggle-fav')" />
      </div>
      <div class="card-text">
        <h2 :style="{ color: accent }">{{ route.name }}</h2>
        <p>
          {{ route.distance_km }} km
          <span v-if="away" class="away">· {{ away }} entfernt</span>
        </p>
      </div>
    </li>
  </RouterLink>
</template>

<style scoped>
.card {
  position: relative;
  height: 165px;
  border-radius: var(--r-card, 15px);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  cursor: pointer;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-md);
}

.card-text {
  position: absolute;
  bottom: 20px;
  width: 100%;
  padding: var(--sp-xs);
  text-align: center;
  font-family: var(--ff-display);
  color: var(--c-primary);
  background: var(--c-bg);
}

.card-text h2 {
  font-weight: var(--fw-bold);
  font-size: var(--fs-md);
}
.card-text p {
  font-weight: var(--fw-light);
  font-size: var(--fs-xs);
}
.away {
  color: var(--c-text-muted);
}

.walk-icon {
  box-sizing: content-box;
  color: var(--c-primary);
  background-color: var(--c-bg);
  border-radius: var(--r-pill);
  padding: var(--sp-xs);
  border: 1px solid var(--c-primary);
}
</style>
