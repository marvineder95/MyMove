<template>
  <div class="max-w-md mx-auto mt-16 card">
    <h1 class="text-2xl font-bold mb-6">{{ t('auth.login') }}</h1>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
        <input v-model="form.email" type="email" required class="w-full" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
        <input v-model="form.password" type="password" required minlength="8" class="w-full" />
      </div>

      <p v-if="auth.error" class="text-sm text-red-600">{{ auth.error }}</p>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="auth.isLoading"
      >
        {{ auth.isLoading ? t('common.loading') : t('auth.login') }}
      </button>
    </form>

    <div class="mt-6 space-y-3">
      <button
        @click="auth.loginWithGoogle"
        class="btn-secondary w-full"
      >
        {{ t('auth.googleLogin') }}
      </button>

      <p class="text-center text-sm text-gray-600">
        {{ t('auth.noAccount') }}
        <RouterLink to="/register" class="text-blue-600 hover:underline">
          {{ t('auth.register') }}
        </RouterLink>
      </p>
    </div>

    <!-- Dev Login (development only) -->
    <div v-if="isDev" class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schnell-Login (Dev)</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="handleDevLogin('admin')"
          class="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Admin
        </button>
        <button
          @click="handleDevLogin('company')"
          class="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Firma
        </button>
        <button
          @click="handleDevLogin('end_customer')"
          class="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Kunde
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const isDev = computed(() => window.location.hostname === 'localhost')

const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  const success = await auth.login(form.email, form.password)
  if (success) {
    redirectAfterLogin()
  }
}

async function handleDevLogin(role: 'admin' | 'company' | 'end_customer') {
  const success = await auth.devLogin(role)
  if (success) {
    redirectAfterLogin()
  }
}

function redirectAfterLogin() {
  if (auth.isAdmin) {
    router.push('/admin')
  } else if (auth.isCompany) {
    router.push('/company/dashboard')
  } else {
    router.push('/dashboard')
  }
}
</script>
