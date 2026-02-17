import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'Landing',
      component: () => import('@/views/public/LandingView.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/register/customer',
      name: 'RegisterCustomer',
      component: () => import('@/views/public/RegisterCustomerView.vue'),
      meta: { public: true }
    },
    {
      path: '/register/company',
      name: 'RegisterCompany',
      component: () => import('@/views/public/RegisterCompanyView.vue'),
      meta: { public: true }
    },

    // Customer routes
    {
      path: '/customer',
      component: () => import('@/layouts/CustomerLayout.vue'),
      meta: { requiresAuth: true, role: 'CUSTOMER' },
      children: [
        {
          path: '',
          name: 'CustomerDashboard',
          component: () => import('@/views/customer/DashboardView.vue')
        },
        {
          path: 'wizard',
          name: 'MoveWizard',
          component: () => import('@/views/customer/MoveWizardView.vue')
        },
        {
          path: 'offers/:id',
          name: 'CustomerOfferDetail',
          component: () => import('@/views/customer/OfferDetailView.vue'),
          props: true
        }
      ]
    },

    // Company routes
    {
      path: '/company',
      component: () => import('@/layouts/CompanyLayout.vue'),
      meta: { requiresAuth: true, role: 'COMPANY' },
      children: [
        {
          path: '',
          name: 'CompanyDashboard',
          component: () => import('@/views/company/DashboardView.vue')
        },
        {
          path: 'profile',
          name: 'CompanyProfile',
          component: () => import('@/views/company/ProfileView.vue')
        },
        {
          path: 'offers/:id',
          name: 'CompanyOfferDetail',
          component: () => import('@/views/company/OfferDetailView.vue'),
          props: true
        },
        {
          path: 'my-offers',
          name: 'CompanyMyOffers',
          component: () => import('@/views/company/MyOffersView.vue')
        }
      ]
    },

    // Admin routes
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'companies/:id',
          name: 'AdminCompanyDetail',
          component: () => import('@/views/admin/CompanyDetailView.vue'),
          props: true
        }
      ]
    },

    // Catch-all
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/public/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Public routes are always accessible
  if (to.meta.public) {
    next()
    return
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // Check role requirements
    const requiredRole = to.meta.role as string
    if (requiredRole && authStore.user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (authStore.isAdmin) {
        next('/admin')
      } else if (authStore.isCompany) {
        next('/company')
      } else {
        next('/customer')
      }
      return
    }
  }
  
  next()
})

export default router
