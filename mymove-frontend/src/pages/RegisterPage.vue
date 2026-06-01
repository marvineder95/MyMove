<template>
  <div class="max-w-md mx-auto mt-16 card">
    <h1 class="text-2xl font-bold mb-6">{{ t('auth.register') }}</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.firstName') }}</label>
          <input v-model="form.firstName" type="text" required minlength="2" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.lastName') }}</label>
          <input v-model="form.lastName" type="text" required minlength="2" class="w-full" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
        <input v-model="form.email" type="email" required class="w-full" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.phone') }}</label>
        <input v-model="form.phone" type="tel" class="w-full" />
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
        {{ auth.isLoading ? t('common.loading') : t('auth.register') }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-gray-600">
      {{ t('auth.hasAccount') }}
      <RouterLink to="/login" class="text-blue-600 hover:underline">
        {{ t('auth.login') }}
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
})

async function handleRegister() {
  const success = await auth.register({
    email: form.email,
    password: form.password,
    firstName: form.firstName,
    lastName: form.lastName,
    phone: form.phone || undefined,
  })
  if (success) {
    router.push('/')
  }
}
</script>
