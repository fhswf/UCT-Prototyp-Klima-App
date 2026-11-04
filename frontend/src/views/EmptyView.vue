<script setup>
defineProps({
  title: {
    type: String,
    default: 'Noch kein Inhalt',
  },
  icon: {
    type: String,
    default: 'kid_star',
  },
  text: {
    type: String,
    default: 'Hier könnte Ihre Werbung stehen.',
  },
})
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <div class="icon">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
      <h1>{{ title }}</h1>
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

span.material-symbols-outlined {
  font-size: 4rem;
  color: var(--c-primary);
}
</style>
