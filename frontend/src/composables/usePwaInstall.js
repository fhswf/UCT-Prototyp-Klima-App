import { ref } from 'vue'

const deferredPrompt = ref(null)
const installed = ref(
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true,
)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt.value = e
})

window.addEventListener('appinstalled', () => {
  installed.value = true
  deferredPrompt.value = null
})

export function usePwaInstall() {
  async function install() {
    const prompt = deferredPrompt.value
    if (!prompt) return
    deferredPrompt.value = null
    prompt.prompt()
    await prompt.userChoice
  }

  return { canInstall: deferredPrompt, installed, isIOS, install }
}
