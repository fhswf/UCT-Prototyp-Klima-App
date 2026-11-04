<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import BottomNav from './components/layout/BottomNav.vue'
import DevJoystick from './components/ui/DevJoystick.vue'
import InstallPrompt from './components/ui/InstallPrompt.vue'
import { useRoute, useRouter } from 'vue-router'
import { useWalkSession } from '@/composables/useWalkSession'
import { useGeolocation } from '@/composables/useGeolocation'
import { revalidateAll } from '@/services/api'

const route = useRoute()
const router = useRouter()
const scroller = ref(null)
const { session, walkFor } = useWalkSession()

useGeolocation()

const CACHED_VIEWS = ['MapView', 'WikiView', 'RouteView', 'TrophiesView', 'ProfileView']

const resumeWalk = computed(() => {
  if (session.value?.mode !== 'active' || route.name === 'WalkGo') return null
  return walkFor(session.value.walkId)
})

function goToNavigation() {
  router.push({ name: 'WalkGo', params: { id: session.value.walkId } })
}

const scrollMemory = new Map()

watch(
  () => route.fullPath,
  async (to, from) => {
    if (from) scrollMemory.set(from, scroller.value?.scrollTop ?? 0)
    revalidateAll()
    await nextTick()
    scroller.value?.scrollTo({ top: scrollMemory.get(to) ?? 0 })
  },
)
</script>

<template>
  <div class="smartphone">
    <main ref="scroller">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="CACHED_VIEWS">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <button v-if="resumeWalk" class="resume-walk" @click="goToNavigation">
      <span class="material-symbols-outlined">navigation</span>
      {{ resumeWalk.name }}: Navigation fortsetzen
    </button>

    <BottomNav v-if="!route.meta?.fullscreen" />

    <InstallPrompt />
  </div>

  <DevJoystick /> <!-- Aktivieren mit devposition.enable() -->
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
}

.smartphone {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

main {
  flex: 1;
  overflow-y: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;
}
main::-webkit-scrollbar {
  display: none;
}

.resume-walk {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-md);
  border: none;
  font-family: var(--ff-base);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-sm);
  color: var(--c-white);
  background: var(--c-primary);
  cursor: pointer;
}

@media (min-width: 412px) {
  .smartphone {
    width: 412px;
    height: 850px;
    border: 12px solid #111;
    border-radius: 48px;
    background-color: var(--background-color);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 4rem auto;
  }
}
</style>
