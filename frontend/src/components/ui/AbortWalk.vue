<script setup>
defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="modal">
      <div v-if="open" class="overlay">
        <div class="wrapper">
          <p>Möchtest du den Klima-Walk wirklich beenden?</p>
          <div class="actions">
            <button @click="emit('cancel')">Abbrechen</button>
            <button @click="emit('confirm')">Bestätigen</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--c-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-xl);
}

.wrapper {
  position: relative;
  width: 100%;
  max-height: 80%;
  overflow-y: auto;
  padding: var(--sp-xl);
  background: var(--c-bg-primary);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-lg);
  margin-top: var(--sp-lg);
}

button {
  flex: 1;
  height: 48px;
  padding: var(--sp-sm);
  border: none;
  border-radius: var(--r-md);
  font-family: var(--ff-base);
  font-weight: var(--fw-bold);
  font-size: var(--fs-md);
  cursor: pointer;
  box-shadow: var(--shadow-btn);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .wrapper,
.modal-leave-active .wrapper {
  transition: transform 0.2s ease;
}
.modal-enter-from .wrapper,
.modal-leave-to .wrapper {
  transform: scale(0.95);
}
</style>
