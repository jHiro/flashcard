import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/CategoryList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quiz/:categoryId',
    name: 'quiz',
    component: () => import('@/components/QuizScreen.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/components/ProgressDashboard.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated && !authStore.isLoading) {
    // 認証が必要な場合でログインしていなければログインページへ
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // ログイン済みならホームへ
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
