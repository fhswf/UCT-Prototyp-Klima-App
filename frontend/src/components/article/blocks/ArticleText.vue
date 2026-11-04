<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  block: { type: Object, required: true }, // { type: 'text', value }
})

const html = computed(() => renderMarkdown(props.block.value))
</script>

<template>
  <div class="text" v-html="html" />
</template>

<style scoped>
.text {
  font-family: var(--ff-base);
  font-weight: var(--fw-regular);
  font-size: var(--fs-md);
}

.text :deep(p) {
  margin: 0 0 var(--sp-md);
}
.text :deep(p:last-child) {
  margin-bottom: 0;
}
.text :deep(ul),
.text :deep(ol) {
  margin: 0 0 var(--sp-md);
  padding-left: 1.25em;
}
.text :deep(li) {
  margin-bottom: var(--sp-xs);
}
.text :deep(a) {
  color: var(--c-primary);
}
.text :deep(strong) {
  font-weight: var(--fw-bold);
}
</style>
