<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'
import CompanyLayout from '@/components/company/CompanyLayout.vue'

const router = useRouter()
const { t } = useI18n()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const layoutComponent = computed(() => {
  return authStore.user?.role === 'COMPANY' ? CompanyLayout : CustomerLayout
})

// Notification toggles (local refs for immediate UI feedback)
const emailNewOffers = ref(true)
const emailOfferUpdates = ref(true)
const emailReminders = ref(true)

// Preferences
const locale = ref('de')
const preferredMovingDays = ref('')
const preferredServices = ref<string[]>([])

// Loading states
const isSavingNotifications = ref(false)
const isSavingPreferences = ref(false)
const saveSuccess = ref<string | null>(null)
const saveError = ref<string | null>(null)

// Delete account
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)
const deleteConfirmText = ref('')

const availableServices = [
  { key: 'packing', label: t('settings.preferences.servicePacking') },
  { key: 'assembly', label: t('settings.preferences.serviceAssembly') },
  { key: 'storage', label: t('settings.preferences.serviceStorage') },
  { key: 'cleaning', label: t('settings.preferences.serviceCleaning') },
]

function showSuccess(message: string) {
  saveSuccess.value = message
  setTimeout(() => { saveSuccess.value = null }, 3000)
}

function showError(message: string) {
  saveError.value = message
  setTimeout(() => { saveError.value = null }, 3000)
}

function loadFromStore() {
  const u = settingsStore.user
  if (u) {
    emailNewOffers.value = u.emailNewOffers ?? true
    emailOfferUpdates.value = u.emailOfferUpdates ?? true
    emailReminders.value = u.emailReminders ?? true
    locale.value = u.locale || 'de'
    preferredMovingDays.value = u.preferredMovingDays || ''
    preferredServices.value = u.preferredServices ? u.preferredServices.split(',').filter(Boolean) : []
  }
}

onMounted(async () => {
  await settingsStore.loadSettings()
  loadFromStore()
})

async function saveNotifications() {
  isSavingNotifications.value = true
  saveError.value = null
  const ok = await settingsStore.updateSettings({
    emailNewOffers: emailNewOffers.value,
    emailOfferUpdates: emailOfferUpdates.value,
    emailReminders: emailReminders.value,
  })
  isSavingNotifications.value = false
  if (ok) {
    showSuccess(t('settings.notifications.saveSuccess'))
  } else {
    showError(settingsStore.error || t('settings.saveError'))
  }
}

async function savePreferences() {
  isSavingPreferences.value = true
  saveError.value = null
  const ok = await settingsStore.updatePreferences({
    locale: locale.value,
    preferredMovingDays: preferredMovingDays.value || undefined,
    preferredServices: preferredServices.value.join(',') || undefined,
  })
  isSavingPreferences.value = false
  if (ok) {
    showSuccess(t('settings.preferences.saveSuccess'))
  } else {
    showError(settingsStore.error || t('settings.saveError'))
  }
}

function toggleService(key: string) {
  const idx = preferredServices.value.indexOf(key)
  if (idx > -1) {
    preferredServices.value.splice(idx, 1)
  } else {
    preferredServices.value.push(key)
  }
}

async function deleteAccount() {
  if (deleteConfirmText.value !== t('settings.deleteConfirmWord')) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await userApi.deleteMe()
    authStore.logout()
    router.push('/')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    deleteError.value = e.response?.data?.message || t('settings.deleteError')
    isDeleting.value = false
  }
}

function openDeleteDialog() {
  showDeleteDialog.value = true
  deleteConfirmText.value = ''
  deleteError.value = null
}

function cancelDelete() {
  showDeleteDialog.value = false
  deleteConfirmText.value = ''
  deleteError.value = null
}

// Icons
function BellIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
    h('path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' }),
  ])
}

function ShieldIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  ])
}

function SlidersIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('line', { x1: '4', y1: '21', x2: '4', y2: '14' }),
    h('line', { x1: '4', y1: '10', x2: '4', y2: '3' }),
    h('line', { x1: '12', y1: '21', x2: '12', y2: '12' }),
    h('line', { x1: '12', y1: '8', x2: '12', y2: '3' }),
    h('line', { x1: '20', y1: '21', x2: '20', y2: '16' }),
    h('line', { x1: '20', y1: '12', x2: '20', y2: '3' }),
    h('line', { x1: '1', y1: '14', x2: '7', y2: '14' }),
    h('line', { x1: '9', y1: '8', x2: '15', y2: '8' }),
    h('line', { x1: '17', y1: '16', x2: '23', y2: '16' }),
  ])
}

function HelpCircleIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
  ])
}

function TrashIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M3 6h18' }),
    h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
    h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
  ])
}

function AlertTriangleIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
    h('path', { d: 'M12 9v4' }),
    h('path', { d: 'M12 17h.01' }),
  ])
}

function SpinnerIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
  ])
}

function MailIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }),
    h('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }),
  ])
}

function CheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '20 6 9 17 4 12' }),
  ])
}
</script>

<template>
  <component :is="layoutComponent">
    <div class="max-w-3xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('settings.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ t('settings.subtitle') }}</p>
      </div>

      <!-- Global Success / Error -->
      <div v-if="saveSuccess" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        {{ saveSuccess }}
      </div>
      <div v-if="saveError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ saveError }}
      </div>

      <!-- Loading state -->
      <div v-if="settingsStore.isLoading" class="py-12 text-center text-gray-500">
        <SpinnerIcon class="w-6 h-6 animate-spin mx-auto mb-3" />
        {{ t('common.loading') }}
      </div>

      <template v-else>
        <!-- 1. Notifications -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <BellIcon class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.notifications.title') }}</h2>
                <p class="text-gray-500 text-sm">{{ t('settings.notifications.subtitle') }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Toggle: new offers -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ t('settings.notifications.newOffers') }}</p>
                  <p class="text-xs text-gray-500">{{ t('settings.notifications.newOffersDesc') }}</p>
                </div>
                <button
                  @click="emailNewOffers = !emailNewOffers"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    emailNewOffers ? 'bg-primary-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      emailNewOffers ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  />
                </button>
              </div>

              <!-- Toggle: offer updates -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ t('settings.notifications.offerUpdates') }}</p>
                  <p class="text-xs text-gray-500">{{ t('settings.notifications.offerUpdatesDesc') }}</p>
                </div>
                <button
                  @click="emailOfferUpdates = !emailOfferUpdates"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    emailOfferUpdates ? 'bg-primary-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      emailOfferUpdates ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  />
                </button>
              </div>

              <!-- Toggle: reminders -->
              <div class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ t('settings.notifications.reminders') }}</p>
                  <p class="text-xs text-gray-500">{{ t('settings.notifications.remindersDesc') }}</p>
                </div>
                <button
                  @click="emailReminders = !emailReminders"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    emailReminders ? 'bg-primary-600' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      emailReminders ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  />
                </button>
              </div>
            </div>

            <div class="mt-5">
              <button
                @click="saveNotifications"
                :disabled="isSavingNotifications"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <SpinnerIcon v-if="isSavingNotifications" class="w-4 h-4 animate-spin" />
                <CheckIcon v-else class="w-4 h-4" />
                {{ isSavingNotifications ? t('common.saving') : t('common.save') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Privacy & Security -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <ShieldIcon class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.privacy.title') }}</h2>
                <p class="text-gray-500 text-sm">{{ t('settings.privacy.subtitle') }}</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 mb-5">
              <p class="text-sm text-gray-700">{{ t('settings.privacy.infoText') }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                disabled
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                :title="t('settings.privacy.exportComingSoon')"
              >
                <MailIcon class="w-4 h-4" />
                {{ t('settings.privacy.exportData') }}
              </button>
              <button
                @click="openDeleteDialog"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <TrashIcon class="w-4 h-4" />
                {{ t('settings.privacy.deleteAccount') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Preferences -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <SlidersIcon class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.preferences.title') }}</h2>
                <p class="text-gray-500 text-sm">{{ t('settings.preferences.subtitle') }}</p>
              </div>
            </div>

            <div class="space-y-4 max-w-md">
              <!-- Language -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('settings.preferences.language') }}</label>
                <select
                  v-model="locale"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                </select>
              </div>

              <!-- Preferred moving days -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('settings.preferences.movingDays') }}</label>
                <input
                  v-model="preferredMovingDays"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  :placeholder="t('settings.preferences.movingDaysPlaceholder')"
                />
                <p class="text-xs text-gray-500 mt-1">{{ t('settings.preferences.movingDaysHint') }}</p>
              </div>

              <!-- Preferred services -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('settings.preferences.services') }}</label>
                <div class="space-y-2">
                  <label
                    v-for="svc in availableServices"
                    :key="svc.key"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      :class="[
                        'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                        preferredServices.includes(svc.key)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 bg-white',
                      ]"
                    >
                      <CheckIcon v-if="preferredServices.includes(svc.key)" class="w-3.5 h-3.5 text-white" />
                    </div>
                    <input
                      type="checkbox"
                      :value="svc.key"
                      :checked="preferredServices.includes(svc.key)"
                      @change="toggleService(svc.key)"
                      class="sr-only"
                    />
                    <span class="text-sm text-gray-700">{{ svc.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="mt-5">
              <button
                @click="savePreferences"
                :disabled="isSavingPreferences"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <SpinnerIcon v-if="isSavingPreferences" class="w-4 h-4 animate-spin" />
                <CheckIcon v-else class="w-4 h-4" />
                {{ isSavingPreferences ? t('common.saving') : t('common.save') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Support -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <HelpCircleIcon class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.support.title') }}</h2>
                <p class="text-gray-500 text-sm">{{ t('settings.support.subtitle') }}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <a
                href="mailto:support@mymove.de"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <MailIcon class="w-4 h-4" />
                {{ t('settings.support.contact') }}
              </a>
              <router-link
                to="/"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {{ t('settings.support.faq') }}
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <!-- Delete Confirmation Dialog -->
      <div
        v-if="showDeleteDialog"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/40" @click="cancelDelete"></div>

        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangleIcon class="w-5 h-5 text-red-500" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ t('settings.deleteDialogTitle') }}</h3>
          </div>

          <p class="text-gray-600 text-sm mb-2">{{ t('settings.deleteDialogText') }}</p>
          <p class="text-red-600 text-sm font-medium mb-5">{{ t('settings.deleteDialogWarning') }}</p>

          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ t('settings.deleteConfirmLabel') }} <span class="font-bold">"{{ t('settings.deleteConfirmWord') }}"</span>
            </label>
            <input
              v-model="deleteConfirmText"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              :placeholder="t('settings.deleteConfirmWord')"
            />
          </div>

          <div v-if="deleteError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {{ deleteError }}
          </div>

          <div class="flex items-center gap-3 justify-end">
            <button
              @click="cancelDelete"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="deleteAccount"
              :disabled="deleteConfirmText !== t('settings.deleteConfirmWord') || isDeleting"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <SpinnerIcon v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <TrashIcon v-else class="w-4 h-4" />
              {{ isDeleting ? t('common.deleting') : t('settings.privacy.deleteAccount') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>
