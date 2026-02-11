<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { BuildingOfficeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import CompanyRegisterForm from '@/components/forms/CompanyRegisterForm.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="font-medium">{{ t('common.backToHome') }}</span>
          </RouterLink>
          <RouterLink to="/" class="flex items-center space-x-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <BuildingOfficeIcon class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MyMove
            </span>
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-2xl">
        <!-- Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <BuildingOfficeIcon class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
              {{ t('auth.register.title') }}
            </h1>
            <p class="text-blue-100">
              {{ t('auth.register.subtitle') }}
            </p>
          </div>

          <!-- Card Body -->
          <div class="px-8 py-8">
            <!-- Info Box -->
            <div class="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    {{ t('auth.register.info.title') }}
                  </h3>
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    {{ t('auth.register.info.description') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Form -->
            <CompanyRegisterForm />

            <!-- Divider -->
            <div class="relative my-8">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  {{ t('auth.register.or') }}
                </span>
              </div>
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400">
                {{ t('auth.register.hasAccount') }}
                <RouterLink
                  to="/login"
                  class="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-1 transition-colors"
                >
                  {{ t('auth.register.loginLink') }}
                </RouterLink>
              </p>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-center text-gray-500 dark:text-gray-400">
              {{ t('auth.register.terms') }}
              <RouterLink to="/terms" class="underline hover:text-gray-700 dark:hover:text-gray-300">
                {{ t('common.terms') }}
              </RouterLink>
              {{ t('common.and') }}
              <RouterLink to="/privacy" class="underline hover:text-gray-700 dark:hover:text-gray-300">
                {{ t('common.privacy') }}
              </RouterLink>
            </p>
          </div>
        </div>

        <!-- Benefits -->
        <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
              {{ t('auth.register.benefits.revenue.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('auth.register.benefits.revenue.description') }}
            </p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
              {{ t('auth.register.benefits.customers.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('auth.register.benefits.customers.description') }}
            </p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
              {{ t('auth.register.benefits.verified.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('auth.register.benefits.verified.description') }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
