import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('@/pages/LandingPage.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/moves/new',
      name: 'CreateMove',
      component: () => import('@/pages/CreateMovePage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/moves/:id/video',
      name: 'VideoUpload',
      component: () => import('@/pages/VideoUploadPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/moves/:id/inventory',
      name: 'Inventory',
      component: () => import('@/pages/InventoryPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/moves/:id/estimate',
      name: 'Estimate',
      component: () => import('@/pages/EstimatePage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/moves/:id/offers',
      name: 'Offers',
      component: () => import('@/pages/OffersPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/my-offers',
      name: 'MyOffers',
      component: () => import('@/pages/ComingSoonPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER', title: 'Angebote' },
    },
    {
      path: '/messages',
      name: 'Messages',
      component: () => import('@/pages/MessagesPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER', title: 'Nachrichten' },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { requiresAuth: true, role: 'END_CUSTOMER' },
    },
    {
      path: '/company/dashboard',
      name: 'CompanyDashboard',
      component: () => import('@/pages/CompanyDashboardPage.vue'),
      meta: { requiresAuth: true, role: 'COMPANY' },
    },
    {
      path: '/company/profile',
      name: 'CompanyProfile',
      component: () => import('@/pages/CompanyProfilePage.vue'),
      meta: { requiresAuth: true, role: 'COMPANY' },
    },
    {
      path: '/company/settings',
      name: 'CompanySettings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { requiresAuth: true, role: 'COMPANY' },
    },
    {
      path: '/company/messages',
      name: 'CompanyMessages',
      component: () => import('@/pages/MessagesPage.vue'),
      meta: { requiresAuth: true, role: 'COMPANY', title: 'Nachrichten' },
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('@/pages/AdminDashboardPage.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/companies',
      name: 'AdminCompanies',
      component: () => import('@/pages/AdminCompaniesPage.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/customers',
      name: 'AdminCustomers',
      component: () => import('@/pages/AdminCustomersPage.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && authStore.token) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    if (authStore.user?.role === 'ADMIN') {
      return next('/admin')
    }
    if (authStore.isCompany) {
      return next('/company/dashboard')
    }
    return next('/')
  }

  if (to.meta.public && authStore.isAuthenticated && to.path !== '/') {
    if (authStore.isAdmin) {
      return next('/admin')
    }
    if (authStore.isCompany) {
      return next('/company/dashboard')
    }
    return next('/dashboard')
  }

  next()
})

export default router
