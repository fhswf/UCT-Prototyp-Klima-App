<script setup>
import AppButton from '@/components/ui/AppButton.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Filter' },
  resettable: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save', 'reset'])
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="slide-up">
      <div v-if="open" class="filter">
        <header class="filter-head">
          <h1 class="filter-title">{{ title }}</h1>
          <button class="close-x" @click="emit('close')" aria-label="Schließen">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div class="options">
          <slot />
        </div>

        <footer class="filter-footer">
          <button v-if="resettable" class="reset" @click="emit('reset')">Zurücksetzen</button>
          <AppButton @click="emit('save')">Speichern</AppButton>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.filter {
  position: absolute;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.filter-head {
  position: relative;
  padding: calc(var(--safe-top) + var(--sp-lg)) var(--sp-lg) var(--sp-md);
  border-bottom: 1px solid var(--c-primary);
}
.filter-title {
  text-align: center;
  color: var(--c-primary);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
}
.close-x {
  position: absolute;
  top: 50%;
  right: var(--sp-md);
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--c-primary);
  cursor: pointer;
}

.options {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: var(--sp-xl);

  scrollbar-width: none;
}
.options::-webkit-scrollbar {
  display: none;
}

.filter-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-lg);
  background: var(--c-bg);
}
.filter-footer :deep(.app-btn) {
  flex: 1;
}
.reset {
  border: none;
  background: none;
  padding: var(--sp-sm) 0;
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  text-decoration: underline;
  cursor: pointer;
}

/* Überschrift je Filterabschnitt – die Eingabe-Bausteine (FilterPills,
   FilterChecks) bringen ihr Styling selbst mit. */
.options :slotted(.section h2) {
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--c-text);
  margin-bottom: var(--sp-md);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
