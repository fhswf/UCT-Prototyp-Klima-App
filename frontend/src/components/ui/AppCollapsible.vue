<script setup>
import { ref } from 'vue'
const props = defineProps({
  title: { type: String, default: '' },
  theme: { type: String, default: 'standort' }, // 'standort' | 'walk'
  defaultOpen: { type: Boolean, default: false },
})
const open = ref(props.defaultOpen)
</script>

<template>
  <section class="collapsible" :class="`theme-${theme}`">
    <div class="head" @click="open = !open">
      <span class="material-symbols-outlined" :class="{ open }">keyboard_arrow_down</span>
      <h2>{{ title }}</h2>
    </div>

    <div class="body-wrap" :class="{ open }">
      <div class="body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  color: var(--c-primary);
  cursor: pointer;

  span {
    font-size: 40px;
    transition: transform 0.3s ease;

    &.open {
      transform: rotate(180deg);
    }
  }

  h2 {
    font-family: var(--ff-display);
    font-size: var(--fs-lg);
    font-weight: var(--fw-regular);
  }
}

.body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.body-wrap.open {
  grid-template-rows: 1fr;
}
.body {
  overflow: hidden;
  min-height: 0;
}

.theme-walk .head {
  background-color: var(--c-bg-secondary);
}
</style>
