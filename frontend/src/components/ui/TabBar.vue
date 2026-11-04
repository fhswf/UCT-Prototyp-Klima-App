<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="tabbar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab"
      :class="{ active: modelValue === tab.key }"
      :disabled="tab.disabled"
      @click="emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabbar {
  display: flex;
  margin-top: var(--sp-lg);
  border-bottom: 1px solid var(--c-primary);

  button {
    font-family: var(--ff-display);
  }
}

.tab {
  flex: 1 1 0;
  position: relative;
  border: none;
  background: none;
  padding: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--c-primary-muted);
  cursor: pointer;
}

.tab.active {
  color: var(--c-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 0px;
  height: 5px;
  background: var(--c-primary);
  border-radius: 10px 10px 0 0;
}

.tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
