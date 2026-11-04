<script setup>
import AppModal from '@/components/ui/AppModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  options: { type: Array, required: true }, // [{ key, label, disabled?, hint? }]
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'close'])

function pick(o) {
  if (o.disabled) return
  emit('update:modelValue', o.key)
  emit('close')
}
</script>

<template>
  <AppModal :open="open" @close="emit('close')">
    <ul class="sort-list">
      <li v-for="o in options" :key="o.key">
        <button :class="{ active: o.key === modelValue }" :disabled="o.disabled" @click="pick(o)">
          {{ o.label }}
          <small v-if="o.disabled && o.hint">{{ o.hint }}</small>
        </button>
      </li>
    </ul>
  </AppModal>
</template>

<style scoped>
.sort-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.sort-list button {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: var(--sp-md) var(--sp-xs);
  font-size: var(--fs-md);
  color: var(--c-text);
  cursor: pointer;
}
.sort-list button.active {
  color: var(--c-accent);
  font-weight: var(--fw-bold);
}
.sort-list button:disabled {
  color: var(--c-text-muted);
  cursor: not-allowed;
}
.sort-list small {
  display: block;
  font-size: var(--fs-xs);
}
</style>
