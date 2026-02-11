<template>
  <div class="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
    <!-- Header -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ $t('auth.login.company.title') }}
      </h2>
      <p class="mt-2 text-gray-600">
        {{ $t('auth.login.company.subtitle') }}
      </p>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
      role="alert"
    >
      <div class="flex items-center">
        <svg
          class="mr-2 h-5 w-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {{ errorMessage }}
      </div>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <FormInput
        v-model="form.email"
        type="email"
        :label="$t('auth.login.fields.email')"
        :placeholder="$t('auth.login.placeholders.email')"
        :error="errors.email"
        required
        autocomplete="email"
        @blur="validateEmail"
      />

      <div class="space-y-1">
        <FormInput
          v-model="form.password"
          type="password"
          :label="$t('auth.login.fields.password')"
          :placeholder="$t('auth.login.placeholders.password')"
          :error="errors.password"
          required
          autocomplete="current-password"
          @blur="validatePassword"
        />
        <div class="flex justify-end">
          <router-link
            to="/auth/forgot-password"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            {{ $t('auth.login.forgotPassword') }}
          </router-link>
        </div>
      </div>

      <button
        type="submit"
        class="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isLoading"
      >
        <svg
          v-if="isLoading"
          class="mr-2 h-5 w-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ isLoading ? $t('common.loading') : $t('auth.login.submit') }}
      </button>
    </form>

    <!-- Register Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        {{ $t('auth.login.noAccount') }}
        <router-link
          to="/auth/register-company"
          class="font-medium text-primary-600 hover:text-primary-500"
        >
          {{ $t('auth.login.registerLink') }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import FormInput from '@/components/UI/FormInput.vue';

const { t } = useI18n();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref('');

interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const form = reactive<LoginForm>({
  email: '',
  password: '',
});

const errors = reactive<LoginErrors>({});

const validateEmail = (): boolean => {
  errors.email = '';
  if (!form.email.trim()) {
    errors.email = t('auth.login.errors.emailRequired');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = t('auth.login.errors.emailInvalid');
    return false;
  }
  return true;
};

const validatePassword = (): boolean => {
  errors.password = '';
  if (!form.password) {
    errors.password = t('auth.login.errors.passwordRequired');
    return false;
  }
  return true;
};

const validateForm = (): boolean => {
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  return isEmailValid && isPasswordValid;
};

const handleSubmit = async () => {
  errorMessage.value = '';

  if (!validateForm()) return;

  isLoading.value = true;

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      type: 'company',
    });
  } catch (error: any) {
    errorMessage.value = error.message || t('auth.login.errors.generic');
  } finally {
    isLoading.value = false;
  }
};
</script>
