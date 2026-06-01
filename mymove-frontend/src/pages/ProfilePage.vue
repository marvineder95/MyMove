<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userApi } from '@/api/user'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'
import CompanyLayout from '@/components/company/CompanyLayout.vue'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const layoutComponent = computed(() => {
  return authStore.user?.role === 'COMPANY' ? CompanyLayout : CustomerLayout
})

const roleLabel = computed(() => {
  return authStore.user?.role === 'COMPANY'
    ? t('profile.roleCompany')
    : t('profile.roleCustomer')
})

// Profile form
const email = ref('')
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const isEditingProfile = ref(false)
const isSavingProfile = ref(false)
const profileError = ref<string | null>(null)
const profileSuccess = ref(false)

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

// Delete account
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)
const deleteConfirmText = ref('')

const passwordMismatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value
})

const canChangePassword = computed(() => {
  return currentPassword.value.length >= 1 && newPassword.value.length >= 8 && !passwordMismatch.value
})

const initials = computed(() => {
  const fn = firstName.value?.[0] || ''
  const ln = lastName.value?.[0] || ''
  return (fn + ln).toUpperCase()
})

function loadFromStore() {
  if (authStore.user) {
    email.value = authStore.user.email || ''
    firstName.value = authStore.user.firstName || ''
    lastName.value = authStore.user.lastName || ''
    phone.value = authStore.user.phone || ''
  }
}

onMounted(() => {
  loadFromStore()
})

async function saveProfile() {
  isSavingProfile.value = true
  profileError.value = null
  profileSuccess.value = false

  try {
    const payload: { email: string; firstName: string; lastName: string; phone?: string } = {
      email: email.value,
      firstName: firstName.value,
      lastName: lastName.value,
    }
    if (phone.value) {
      payload.phone = phone.value
    }

    const { data } = await userApi.updateMe(payload)
    authStore.user = data.user
    isEditingProfile.value = false
    profileSuccess.value = true

    setTimeout(() => {
      profileSuccess.value = false
    }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    profileError.value = e.response?.data?.message || t('profile.saveError')
  } finally {
    isSavingProfile.value = false
  }
}

function cancelEdit() {
  loadFromStore()
  isEditingProfile.value = false
  profileError.value = null
  profileSuccess.value = false
}

async function changePassword() {
  if (!canChangePassword.value) return

  isChangingPassword.value = true
  passwordError.value = null
  passwordSuccess.value = false

  try {
    await userApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })

    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    passwordError.value = e.response?.data?.message || t('profile.passwordError')
  } finally {
    isChangingPassword.value = false
  }
}

async function deleteAccount() {
  if (deleteConfirmText.value !== t('profile.deleteConfirmWord')) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await userApi.deleteMe()
    authStore.logout()
    router.push('/')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    deleteError.value = e.response?.data?.message || t('profile.deleteError')
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
function PencilIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }),
  ])
}

function SaveIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
    h('polyline', { points: '17 21 17 13 7 13 7 21' }),
    h('polyline', { points: '7 3 7 8 15 8' }),
  ])
}

function SpinnerIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }),
  ])
}

function LockIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }),
    h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }),
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
</script>

<template>
  <component :is="layoutComponent">
    <div class="max-w-3xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('profile.title') }}</h1>
      <p class="text-gray-500 mt-1">{{ t('profile.subtitle') }}</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div class="p-6">
        <div class="flex items-start gap-5">
          <!-- Avatar -->
          <div class="shrink-0">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">
              {{ initials }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ firstName }} {{ lastName }}
              </h2>
              <button
                v-if="!isEditingProfile"
                @click="isEditingProfile = true"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <PencilIcon class="w-4 h-4" />
                {{ t('common.edit') }}
              </button>
            </div>
            <p class="text-gray-500 text-sm">{{ email }}</p>
            <p class="text-gray-400 text-xs mt-1">{{ roleLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="isEditingProfile" class="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.firstName') }}</label>
            <input
              v-model="firstName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('auth.firstName')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.lastName') }}</label>
            <input
              v-model="lastName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('auth.lastName')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.email') }}</label>
            <input
              v-model="email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('auth.email')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('auth.phone') }}</label>
            <input
              v-model="phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('auth.phone')"
            />
          </div>
        </div>

        <!-- Error / Success -->
        <div v-if="profileError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {{ profileError }}
        </div>
        <div v-if="profileSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {{ t('profile.saveSuccess') }}
        </div>

        <!-- Actions -->
        <div class="mt-4 flex items-center gap-3">
          <button
            @click="saveProfile"
            :disabled="isSavingProfile"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SaveIcon v-if="!isSavingProfile" class="w-4 h-4" />
            <SpinnerIcon v-else class="w-4 h-4 animate-spin" />
            {{ isSavingProfile ? t('common.saving') : t('common.save') }}
          </button>
          <button
            @click="cancelEdit"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Card -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('profile.passwordTitle') }}</h3>
        <p class="text-gray-500 text-sm mb-5">{{ t('profile.passwordSubtitle') }}</p>

        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('profile.currentPassword') }}</label>
            <input
              v-model="currentPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('profile.currentPassword')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('profile.newPassword') }}</label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :placeholder="t('profile.newPassword')"
            />
            <p v-if="newPassword && newPassword.length < 8" class="text-xs text-red-500 mt-1">
              {{ t('profile.passwordMinLength') }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('profile.confirmPassword') }}</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': passwordMismatch }"
              :placeholder="t('profile.confirmPassword')"
            />
            <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">
              {{ t('profile.passwordMismatch') }}
            </p>
          </div>
        </div>

        <!-- Error / Success -->
        <div v-if="passwordError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 max-w-md">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 max-w-md">
          {{ t('profile.passwordSuccess') }}
        </div>

        <!-- Action -->
        <div class="mt-5">
          <button
            @click="changePassword"
            :disabled="!canChangePassword || isChangingPassword"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SpinnerIcon v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
            <LockIcon v-else class="w-4 h-4" />
            {{ isChangingPassword ? t('common.saving') : t('profile.changePassword') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Card -->
    <div class="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <TrashIcon class="w-5 h-5 text-red-500" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('profile.deleteTitle') }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ t('profile.deleteSubtitle') }}</p>
            <button
              @click="openDeleteDialog"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <TrashIcon class="w-4 h-4" />
              {{ t('profile.deleteButton') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="cancelDelete"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangleIcon class="w-5 h-5 text-red-500" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ t('profile.deleteDialogTitle') }}</h3>
        </div>

        <p class="text-gray-600 text-sm mb-2">{{ t('profile.deleteDialogText') }}</p>
        <p class="text-red-600 text-sm font-medium mb-5">{{ t('profile.deleteDialogWarning') }}</p>

        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            {{ t('profile.deleteConfirmLabel') }} <span class="font-bold">"{{ t('profile.deleteConfirmWord') }}"</span>
          </label>
          <input
            v-model="deleteConfirmText"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            :placeholder="t('profile.deleteConfirmWord')"
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
            :disabled="deleteConfirmText !== t('profile.deleteConfirmWord') || isDeleting"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <SpinnerIcon v-if="isDeleting" class="w-4 h-4 animate-spin" />
            <TrashIcon v-else class="w-4 h-4" />
            {{ isDeleting ? t('common.deleting') : t('profile.deleteButton') }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </component>
</template>
