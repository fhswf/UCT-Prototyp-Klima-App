<script setup>
defineProps({
  block: { type: Object, required: true }, // { type: 'heading', value }
})
</script>

<template>
  <p class="heading">{{ block.value }}</p>
</template>

<style scoped>
.heading {
  font-family: var(--ff-base);
  font-weight: var(--fw-bold);
  font-size: var(--fs-md);
  color: var(--c-accent);
  margin-bottom: var(--sp-md);
}
</style>
