import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

// Lazy-loaded views for better performance
const HomeView = () => import('@/views/HomeView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

// Route definitions
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'MyMove - Ihre Umzugsplattform'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: {
      title: 'Registrieren - MyMove',
      guestOnly: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Anmelden - MyMove',
      guestOnly: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard - MyMove',
      requiresAuth: true,
      isAdmin: false
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: {
      title: 'Admin - MyMove',
      requiresAuth: true,
      isAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Seite nicht gefunden - MyMove'
    }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // Scroll to top on route change, or restore saved position
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// Global navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Update page title
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated (Token existiert)
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Check admin access (wenn Admin-Route)
    const isAdminRoute = to.meta.isAdmin as boolean
    if (isAdminRoute && !authStore.isAdmin) {
      // Nicht Admin -> Dashboard
      next({ path: '/dashboard' })
      return
    }

    // Check company access (wenn Company-Route aber Admin versucht zuzugreifen)
    if (!isAdminRoute && authStore.isAdmin) {
      // Admin versucht auf Company Dashboard -> Admin View
      next({ path: '/admin' })
      return
    }
  }

  // Check guest-only routes (login, register) for authenticated users
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    // Redirect authenticated users away from login/register
    if (authStore.isAdmin) {
      next({ path: '/admin' })
    } else {
      next({ path: '/dashboard' })
    }
    return
  }

  // Allow navigation
  next()
})

// Global after hook for analytics/logging
router.afterEach((to, from) => {
  // Log navigation for debugging
  console.log(`[Router] Navigated from "${from.name?.toString() || 'unknown'}" to "${to.name?.toString() || 'unknown'}"`)
})

export default router