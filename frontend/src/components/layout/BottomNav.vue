<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { navIcons } from '@/icons'

const route = useRoute()

// Unterseiten auf ihre Sektion mappen
const section = computed(() => {
  const p = route.path
  if (p.startsWith('/wiki') || p.startsWith('/standort') || p.startsWith('/deepdive')) return 'wiki'
  if (p.startsWith('/routen') || p.startsWith('/walk')) return 'routen'
  if (p.startsWith('/karte')) return 'karte'
  if (p.startsWith('/erfolge')) return 'erfolge'
  if (p.startsWith('/profil')) return 'profil'
  return ''
})
</script>

<template>
  <nav>
    <RouterLink to="/wiki" :class="{ active: section === 'wiki' }">
      <AppIcon :name="navIcons.wiki" class="nav-icon" :size="28" />
      <p>Klima-Wiki</p>
    </RouterLink>

    <RouterLink to="/routen" :class="{ active: section === 'routen' }">
      <AppIcon :name="navIcons.routen" class="nav-icon" :size="28" />
      <p>Routen</p>
    </RouterLink>

    <RouterLink to="/karte" :class="{ active: section === 'karte' }">
      <AppIcon :name="navIcons.karte" class="nav-icon" :size="28" />
      <p>Karte</p>
    </RouterLink>

    <RouterLink to="/erfolge" :class="{ active: section === 'erfolge' }">
      <AppIcon :name="navIcons.erfolge" class="nav-icon" :size="28" />
      <p>Erfolge</p>
    </RouterLink>

    <RouterLink to="/profil" :class="{ active: section === 'profil' }">
      <AppIcon :name="navIcons.profil" class="nav-icon" :size="28" />
      <p>Profil</p>
    </RouterLink>
  </nav>
</template>

<style scoped>
nav {
  position: sticky;
  bottom: 0;
  z-index: 1;
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  color: var(--c-primary);
  background-color: var(--c-bg-primary);
  filter: drop-shadow(0px -2px 4px rgba(0, 0, 0, 0.25));

  p {
    font-family: var(--ff-display);
    font-weight: 400;
    font-size: 13px;
    padding: 0;
    margin: 0;
  }

  a {
    text-decoration: none;
    color: var(--c-primary);
    flex: 1 1 0px;
    text-align: center;

    &:hover {
      opacity: 0.8;
    }
  }

  .nav-icon {
    height: 29px;
    margin-bottom: 5px;
  }
}

a.active {
  color: var(--c-accent);
}
</style>
