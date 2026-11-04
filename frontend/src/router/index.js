import { createRouter, createWebHistory } from 'vue-router'
import { checkLogin } from '@/lib/login'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { fullscreen: true },
    },
    { path: '/', redirect: '/karte' },
    { path: '/wiki', name: 'Wiki', component: () => import('@/views/WikiView.vue') },
    { path: '/routen', name: 'Routen', component: () => import('@/views/RouteView.vue') },
    { path: '/karte', name: 'Karte', component: () => import('@/views/MapView.vue') },
    { path: '/erfolge', name: 'Erfolge', component: () => import('@/views/TrophiesView.vue') },
    { path: '/profil', name: 'Profil', component: () => import('@/views/ProfileView.vue') },
    {
      path: '/standort/:id',
      name: 'Standort',
      component: () => import('@/views/LocationView.vue'),
    },
    { path: '/walk/:id', name: 'Walk', component: () => import('@/views/WalkView.vue') },
    {
      path: '/walk/:id/go',
      name: 'WalkGo',
      component: () => import('@/views/WalkNavigationView.vue'),
    },
    {
      path: '/deepdive/:id',
      name: 'DeepDive',
      component: () => import('@/views/DeepDiveView.vue'),
    },
    /* catch all ->  */
    { path: '/:catchAll(.*)', redirect: '/karte' },
  ],
})

router.beforeEach(async (to, from, next) => {
  const publicPages = ['/login']
  const isLoggedIn = await checkLogin()

  if (!publicPages.includes(to.path) && !isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  else if (publicPages.includes(to.path) && isLoggedIn) {
    return next('/karte')
  }
  next()
})

export default router
