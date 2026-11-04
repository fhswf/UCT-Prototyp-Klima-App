<script setup>
defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, required: true }, // [{ value, label }]
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="check-grid">
    <label v-for="o in options" :key="o.value" class="check">
      <input
        type="checkbox"
        :value="o.value"
        :checked="modelValue.includes(o.value)"
        @change="
          emit(
            'update:modelValue',
            $event.target.checked
              ? [...modelValue, o.value]
              : modelValue.filter((v) => v !== o.value),
          )
        "
      />
      {{ o.label }}
    </label>
  </div>
</template>

<style scoped>
.check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md) var(--sp-lg);
}
.check {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  cursor: pointer;
}
.check input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: var(--c-primary);
}
</style>
