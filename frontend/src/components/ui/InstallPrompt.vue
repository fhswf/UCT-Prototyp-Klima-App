<script setup>
import { computed, ref } from 'vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { canInstall, installed, isIOS, install } = usePwaInstall()

const DISMISSED_KEY = 'klima:install-dismissed'
const dismissed = ref(localStorage.getItem(DISMISSED_KEY) === '1')

const open = computed(
  () => (!!canInstall.value || isIOS) && !installed.value && !dismissed.value,
)

function dismiss() {
  dismissed.value = true
  localStorage.setItem(DISMISSED_KEY, '1')
}

async function doInstall() {
  await install()
  dismiss()
}
</script>

<template>
  <Teleport to=".smartphone">
    <Transition name="modal">
      <div v-if="open" class="overlay">
        <div class="wrapper">
          <img src="/pwa-192.png" alt="" class="app-icon" />
          <template v-if="isIOS && !canInstall">
            <p>
              Klima-App zum Startbildschirm hinzufügen: Tippe unten auf
              <span class="material-symbols-outlined ios-share-icon">ios_share</span>
              und dann auf „Zum Home-Bildschirm“.
            </p>
            <div class="actions">
              <button class="primary" @click="dismiss">Verstanden</button>
            </div>
          </template>
          <template v-else>
            <p>Klima-App zum Startbildschirm hinzufügen und wie eine App nutzen?</p>
            <div class="actions">
              <button @click="dismiss">Nicht jetzt</button>
              <button class="primary" @click="doInstall">Installieren</button>
            </div>
          </template>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-md);
  padding: var(--sp-xl);
  background: var(--c-bg-primary);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--r-md);
}

.ios-share-icon {
  font-size: 18px;
  vertical-align: middle;
  color: var(--c-primary);
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-lg);
  width: 100%;
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

button.primary {
  background: var(--c-primary);
  color: var(--c-white);
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
