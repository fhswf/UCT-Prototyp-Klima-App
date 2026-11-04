<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
})
defineEmits(['close'])
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="card">
      <div v-if="open" class="info-overlay" @click.self="$emit('close')">
        <div class="info-card">
          <h2>{{ title }}</h2>
          <p>{{ text }}</p>
          <button @click="$emit('close')">Okay</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.info-overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  background: var(--c-overlay);
  display: flex;
  align-items: flex-end;
}

.info-card {
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--c-bg-primary);
  border-radius: var(--r-md) var(--r-md) 0 0;
  padding: var(--sp-xl);
  box-shadow: var(--shadow-md);
}

.info-card h2 {
  font-family: var(--ff-display);
  margin-bottom: var(--sp-lg);
  color: var(--c-primary);
  font-size: var(--fs-lg);
}

.info-card p {
  margin-bottom: var(--sp-lg);
  font-size: var(--fs-sm);
  font-weight: var(--fw-regular);
}

.info-card button {
  padding: var(--sp-xl);
  background-color: var(--c-bg);
  color: var(--c-primary);
  border: none;
  border-radius: var(--r-md);
  font-size: var(--fs-md);
  width: 100%;
  font-weight: var(--fw-bold);
  cursor: pointer;
  box-shadow: var(--shadow-btn);
}

.card-enter-active,
.card-leave-active {
  transition: opacity 0.25s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
}
.card-enter-active .info-card,
.card-leave-active .info-card {
  transition: transform 0.25s ease;
}
.card-enter-from .info-card,
.card-leave-to .info-card {
  transform: translateY(100%);
}
</style>
