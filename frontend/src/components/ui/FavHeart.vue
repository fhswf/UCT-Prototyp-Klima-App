<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <button
    class="fav"
    type="button"
    :class="{ active: modelValue }"
    :aria-pressed="modelValue"
    @click.stop.prevent="emit('update:modelValue', !modelValue)"
    aria-label="Favorit"
  >
    <span class="material-symbols-outlined">favorite</span>
  </button>
</template>

<style scoped>
.fav {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--fav-color, var(--c-white));
  text-shadow: var(--fav-shadow, 0 1px 4px rgba(0, 0, 0, 0.55));
}
.fav .material-symbols-outlined {
  font-size: var(--fs-xl);
}
.fav.active .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}
</style>
