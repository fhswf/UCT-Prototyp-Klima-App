<script setup>
const props = defineProps({
  modelValue: { type: String, default: null },
  options: { type: Array, required: true }, // [{ value, label }]
  name: { type: String, required: true },
  clearable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function pick(value) {
  emit('update:modelValue', props.clearable && props.modelValue === value ? null : value)
}
</script>

<template>
  <div class="pill-group">
    <template v-for="o in options" :key="o.value">
      <input
        type="radio"
        class="pill-input"
        :id="`${name}-${o.value}`"
        :name="name"
        :checked="modelValue === o.value"
        @click="pick(o.value)"
      />
      <label :for="`${name}-${o.value}`" class="pill">{{ o.label }}</label>
    </template>
  </div>
</template>

<style scoped>
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
}
.pill-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.pill {
  padding: var(--sp-sm) var(--sp-xl);
  border: 1.5px solid var(--c-primary);
  border-radius: var(--r-pill);
  color: var(--c-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}
.pill-input:checked + .pill {
  background: var(--c-primary);
  color: var(--c-text-on-primary);
}
.pill-input:focus-visible + .pill {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>
