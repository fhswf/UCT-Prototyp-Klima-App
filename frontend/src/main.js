import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@fontsource-variable/figtree'
import '@fontsource-variable/oswald'
import 'material-symbols/outlined.css'

import './assets/css/theme.css'
import placeholder from '@/assets/images/placeholder.jpg'
import AppIcon from '@/components/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'

const app = createApp(App)

app.component('AppIcon', AppIcon)
app.component('AppButton', AppButton)

app.directive('img-fallback', {
  // beim Einfügen ins DOM
  mounted(el) {
    // Placeholder img
    if (!el.getAttribute('src')) {
      el.src = placeholder
    }
    el.addEventListener('error', () => {
      if (el.src !== placeholder) {
        el.src = placeholder
      }
    })
  },
  updated(el) {
    if (!el.getAttribute('src')) {
      el.src = placeholder
    }
  },
})

app.directive('bg-fallback', {
  mounted(el, binding) {
    setBg(el, binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      setBg(el, binding.value)
    }
  },
})

function setBg(el, url) {
  if (!url) {
    el.style.backgroundImage = `url(${placeholder})`
    return
  }
  const img = new Image()
  img.onload = () => {
    el.style.backgroundImage = `url(${url})`
  }
  img.onerror = () => {
    el.style.backgroundImage = `url(${placeholder})`
  }
  img.src = url
}

app.use(router)

app.mount('#app')
