<script setup>
import { computed, watchEffect } from 'vue'
import { bitmapIcons } from '@/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
})

const modules = import.meta.glob('@/assets/icons/*.svg', {
  eager: true,
  query: '?component',
  import: 'default',
})
const urlModules = import.meta.glob('@/assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = (mods) =>
  Object.fromEntries(
    Object.entries(mods).map(([path, mod]) => [path.split('/').pop().replace('.svg', ''), mod]),
  )

const icons = byName(modules)
const urls = byName(urlModules)

// Auflösungsreihenfolge: Bitmap-SVG -> Vektor-SVG -> Material-Symbol.
const hasBitmap = computed(() => bitmapIcons.has(props.name) && !!urls[props.name])
const iconComp = computed(() => icons[props.name] ?? null)
const isMaterial = computed(
  () => !hasBitmap.value && !iconComp.value && /^[a-z0-9_]+$/.test(props.name),
)

if (import.meta.env.DEV) {
  watchEffect(() => {
    if (!hasBitmap.value && !iconComp.value && !isMaterial.value) {
      console.warn(`[AppIcon] "${props.name}" nicht gefunden (kein SVG, kein Material-Symbol).`)
    }
  })
}

const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <!-- Bitmap-Icon: Alphakanal als Maske, Einfärbung über currentColor -->
  <span
    v-if="hasBitmap"
    class="app-icon app-icon--bitmap"
    :style="{ width: px, height: px, '--icon-url': `url(${urls[name]})` }"
    aria-hidden="true"
  />
  <!-- Eigenes Vektor-SVG -->
  <component
    :is="iconComp"
    v-else-if="iconComp"
    class="app-icon"
    :style="{ width: px, height: px }"
    aria-hidden="true"
  />
  <!-- Fallback: Google Material Symbol -->
  <span
    v-else-if="isMaterial"
    class="material-symbols-outlined app-icon"
    :style="{ fontSize: px }"
    aria-hidden="true"
    >{{ name }}</span
  >
</template>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.app-icon--bitmap {
  background-color: currentColor;
  -webkit-mask: var(--icon-url) center / contain no-repeat;
  mask: var(--icon-url) center / contain no-repeat;
}

span.material-symbols-outlined.app-icon {
  width: 1em;
  line-height: 1;
  text-align: center;
}
</style>
