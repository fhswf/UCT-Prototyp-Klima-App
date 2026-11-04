<script setup>
defineProps({
  block: { type: Object, required: true }, // { type: 'image', url, alt }
})
</script>

<template>
  <img class="image" :src="block.url" :alt="block.alt ?? ''" />
</template>

<style scoped>
.image {
  width: 100%;
  height: auto;
  max-width: 100%;
  margin: calc(var(--sp-xl) * 2) 0;
}
</style>
