<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const { t, locale: i18nLocale } = useI18n()

const isMobileMenuOpen = ref(false)
const langOpen = ref(false)

const menuItems = [
  { key: 'overview', label: t('companyDashboard.sidebar.overview'), icon: LayoutDashboardIcon, route: '/company/dashboard' },
  { key: 'orders', label: t('companyDashboard.sidebar.orders'), icon: BriefcaseIcon, route: '/company/orders', badge: companyStore.dashboard?.kpis.confirmedOrders ?? 0 },
  { key: 'offers', label: t('companyDashboard.sidebar.offers'), icon: FileTextIcon, route: '/company/offers' },
  { key: 'calendar', label: t('companyDashboard.sidebar.calendar'), icon: CalendarIcon, route: '/company/calendar' },
  { key: 'team', label: t('companyDashboard.sidebar.team'), icon: UsersIcon, route: '/company/team' },
  { key: 'vehicles', label: t('companyDashboard.sidebar.vehicles'), icon: TruckIcon, route: '/company/vehicles' },
  { key: 'pricing', label: t('companyDashboard.sidebar.pricing'), icon: TagIcon, route: '/company/pricing' },
  { key: 'reviews', label: t('companyDashboard.sidebar.reviews'), icon: StarIcon, route: '/company/reviews' },
  { key: 'messages', label: t('companyDashboard.sidebar.messages'), icon: MessageCircleIcon, route: '/company/messages' },
  { key: 'profile', label: t('companyDashboard.sidebar.profile'), icon: UserIcon, route: '/company/profile' },
  { key: 'settings', label: t('companyDashboard.sidebar.settings'), icon: SettingsIcon, route: '/company/settings' },
]

const isActive = (path: string) => route.path === path

function handleItemClick(item: typeof menuItems[0]) {
  if (item.route) {
    router.push(item.route)
    isMobileMenuOpen.value = false
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push('/')
  isMobileMenuOpen.value = false
}

const companyName = computed(() => {
  return companyStore.company?.companyName || t('companyDashboard.yourCompany')
})

const companyInitials = computed(() => {
  const name = companyStore.company?.companyName || ''
  return name.slice(0, 2).toUpperCase() || 'Co'
})

const currentLocale = computed(() => i18nLocale.value)

function setLocale(val: string) {
  i18nLocale.value = val
  langOpen.value = false
}

// ─── Icons ───
function LayoutDashboardIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
  ])
}

function BriefcaseIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '2', y: '7', width: '20', height: '14', rx: '2' }),
    h('path', { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }),
  ])
}

function FileTextIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
    h('line', { x1: '10', y1: '9', x2: '8', y2: '9' }),
  ])
}

function CalendarIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
  ])
}

function UsersIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '9', cy: '7', r: '4' }),
    h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
    h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
  ])
}

function TruckIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M10 17h4V5H2v12h3' }),
    h('path', { d: 'M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1' }),
    h('circle', { cx: '7.5', cy: '17.5', r: '2.5' }),
    h('circle', { cx: '17.5', cy: '17.5', r: '2.5' }),
  ])
}

function TagIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z' }),
    h('circle', { cx: '7', cy: '7', r: '1' }),
  ])
}

function StarIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
  ])
}

function UserIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ])
}

function MessageCircleIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z' }),
  ])
}

function SettingsIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    h('circle', { cx: '12', cy: '12', r: '3' }),
  ])
}

function MenuIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
    h('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
    h('line', { x1: '3', y1: '18', x2: '21', y2: '18' }),
  ])
}

function XIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
    h('line', { x1: '6', y1: '6', x2: '18', y2: '18' }),
  ])
}

function GlobeIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
    h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }),
  ])
}

function LogoutIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
    h('polyline', { points: '16 17 21 12 16 7' }),
    h('line', { x1: '21', y1: '12', x2: '9', y2: '12' }),
  ])
}
</script>

<template>
  <div>
    <!-- Mobile hamburger button -->
    <button
      @click="toggleMobileMenu"
      class="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600"
      aria-label="Menü"
    >
      <MenuIcon v-if="!isMobileMenuOpen" />
      <XIcon v-else />
    </button>

    <!-- Mobile logo header -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center justify-center">
      <RouterLink to="/company/dashboard">
        <img src="/assets/img/MyMoveLogoSchrift.png" alt="MyMove" class="h-10 w-auto object-contain" />
      </RouterLink>
    </div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-20 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300',
        'top-0 left-0 h-screen',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Desktop logo -->
      <div class="hidden lg:flex items-center px-4 h-16 border-b border-gray-100">
        <RouterLink to="/company/dashboard" class="flex items-center">
          <img src="/assets/img/MyMoveLogoSchrift.png" alt="MyMove" class="h-10 w-auto object-contain" />
        </RouterLink>
      </div>

      <!-- Mobile header spacer -->
      <div class="lg:hidden h-14 shrink-0" />

      <!-- Company profile section -->
      <div class="px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {{ companyInitials }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ companyName }}</p>
            <p class="text-xs text-gray-500">{{ t('companyDashboard.sidebar.company') }}</p>
          </div>
        </div>

        <!-- Language switcher -->
        <div class="mt-3 relative">
          <button
            @click="langOpen = !langOpen"
            class="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors w-full"
          >
            <GlobeIcon />
            <span>{{ currentLocale === 'de' ? 'Deutsch' : 'English' }}</span>
            <svg class="w-3 h-3 ml-auto" :class="langOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="langOpen" class="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
            <button @click="setLocale('de')" :class="['w-full text-left px-3 py-2 text-sm hover:bg-gray-50', currentLocale === 'de' ? 'text-primary-700 font-medium' : 'text-gray-700']">
              Deutsch
            </button>
            <button @click="setLocale('en')" :class="['w-full text-left px-3 py-2 text-sm hover:bg-gray-50', currentLocale === 'en' ? 'text-primary-700 font-medium' : 'text-gray-700']">
              English
            </button>
          </div>
        </div>
      </div>

      <!-- Main nav -->
      <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <button
          v-for="item in menuItems"
          :key="item.key"
          @click="handleItemClick(item)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.route)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
        >
          <component :is="item.icon" class="shrink-0" />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge > 0"
            class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </button>
      </nav>

      <!-- Bottom section -->
      <div class="p-3 border-t border-gray-100 space-y-1">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogoutIcon class="shrink-0" />
          <span class="flex-1 text-left">{{ t('auth.logout') }}</span>
        </button>

        <!-- Help CTA card -->
        <div class="bg-primary-50 rounded-xl p-3 mt-2">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="text-xs font-medium text-primary-900">{{ t('companyDashboard.help.title') }}</span>
          </div>
          <p class="text-[11px] text-primary-600 mb-2">{{ t('companyDashboard.help.subtitle') }}</p>
          <button class="inline-flex items-center text-[11px] font-medium text-primary-600 hover:text-primary-700">
            {{ t('companyDashboard.help.link') }}
            <svg class="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="isMobileMenuOpen"
      @click="toggleMobileMenu"
      class="fixed inset-0 bg-black/20 z-10 lg:hidden"
    />
  </div>
</template>
