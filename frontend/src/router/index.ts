import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // redirect from root to login
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      // component is lazy-loaded just when the route is visited
      component: () => import('../views/LoginView.vue'),
      // om redan inloggad skicka direkt till dashbordet
      beforeEnter: (_to, _from, next) => {
        const auth = useAuthStore()
        if (auth.isAuthenticated) next('/dashboard')
        else next()
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      // markerar att denna routen kräver inloggning
      meta: { requiresAuth: true },
    },
  ],
})

// global navigation guard 
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) next({ name: 'login' })
  else next()
})

export default router