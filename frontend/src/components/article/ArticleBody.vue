<script setup>
import ArticleHeading from './blocks/ArticleHeading.vue'
import ArticleText from './blocks/ArticleText.vue'
import ArticleImage from './blocks/ArticleImage.vue'

defineProps({
  blocks: { type: Array, default: () => [] },
  heading: { type: String, default: '' }, // leer -> keine Überschrift rendern
})

// block.type -> Komponente
const blockMap = {
  heading: ArticleHeading,
  text: ArticleText,
  image: ArticleImage,
}
</script>

<template>
  <article class="body">
    <h1 v-if="heading">{{ heading }}</h1>
    <template v-for="(block, i) in blocks" :key="i">
      <component :is="blockMap[block.type]" v-if="blockMap[block.type]" :block="block" />
    </template>
  </article>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  padding: var(--sp-lg);
}

h1 {
  font-family: var(--ff-base);
  font-weight: var(--fw-bold);
  font-size: var(--fs-lg);
  color: var(--c-accent);
}
</style>
