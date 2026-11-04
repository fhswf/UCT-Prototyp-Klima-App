<script setup>
defineProps({
  sortLabel: { type: String, required: true },
  filterCount: { type: Number, required: true },
  theme: { type: String, default: 'standort' }, // 'standort' or 'topic'
})
defineEmits(['open-sort', 'open-filter'])
</script>

<template>
  <div class="toolbar" :class="`theme-${theme}`">
    <button class="sort" @click="$emit('open-sort')">
      <span class="material-symbols-outlined">swap_vert</span>
      {{ sortLabel }}
    </button>
    <button class="filter" @click="$emit('open-filter')">
      <span class="material-symbols-outlined">tune</span>
      Filter ({{ filterCount }})
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sort,
.filter {
  display: flex;
  align-items: center;
  font-size: 14px;

  span.material-symbols-outlined {
    font-size: 12px;
    margin-right: 5px;
  }

  cursor: pointer;
}

.filter {
  padding: 10px 22px;
  font-weight: 600;
  color: var(--c-white);
  background-color: var(--c-primary);
  border: none;
  border-radius: 50px;

  &:hover {
    background-color: var(--c-white);
    color: var(--c-primary);
  }
}

.sort {
  font-weight: 600;
  background: none;
  border: none;
  border-radius: 0;
  color: var(--c-primary);

  &:hover {
    color: var(--c-white);
  }
}
</style>
