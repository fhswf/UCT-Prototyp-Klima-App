<script setup>
defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal">
          <button class="close-x" @click="emit('close')" aria-label="Schließen">
            <span class="material-symbols-outlined">close</span>
          </button>
          <slot />
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

.modal {
  position: relative;
  width: 100%;
  max-height: 80%;
  overflow-y: auto;
  padding: var(--sp-xl);
  background: var(--c-bg);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}

.close-x {
  position: absolute;
  top: var(--sp-md);
  right: var(--sp-md);
  border: none;
  background: none;
  color: var(--c-text);
  cursor: pointer;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
