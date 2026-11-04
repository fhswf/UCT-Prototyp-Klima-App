<script setup>
import ArticleBody from '@/components/article/ArticleBody.vue'

defineProps({
  title: { type: String, default: 'Was kann ich tun?' },
  body: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="action">
    <h2 class="action-title">{{ title }}</h2>
    <ArticleBody :blocks="body" />
  </section>
</template>

<style scoped>
.action {
  padding: var(--sp-xl);
  background: var(--c-bg-primary);
}

.action-title {
  font-family: var(--ff-base);
  color: var(--c-primary);
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  margin-bottom: var(--sp-md);
}

.action :deep(.body) {
  padding: 0;
  gap: var(--sp-lg);
}
.action :deep(.image) {
  margin: var(--sp-md) 0;
  border-radius: var(--r-md);
}
</style>
