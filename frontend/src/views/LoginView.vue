<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { 
  BuildingOfficeIcon, 
  ArrowLeftIcon, 
  UserIcon, 
  ShieldCheckIcon 
} from '@heroicons/vue/24/outline'
import CompanyLoginForm from '@/components/forms/CompanyLoginForm.vue'
import AdminLoginForm from '@/components/forms/AdminLoginForm.vue'

type LoginTab = 'company' | 'admin'

const { t } = useI18n()
const activeTab = ref<LoginTab>('company')

const setTab = (tab: LoginTab) => {
  activeTab.value = tab
}
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
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <UserIcon class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
              {{ t('auth.login.title') }}
            </h1>
            <p class="text-blue-100">
              {{ t('auth.login.subtitle') }}
            </p>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
              @click="setTab('company')"
              class="flex-1 flex items-center justify-center py-4 px-4 text-sm font-medium transition-colors relative"
              :class="activeTab === 'company' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
            >
              <BuildingOfficeIcon class="w-5 h-5 mr-2" />
              {{ t('auth.login.tabs.company') }}
              <div
                v-if="activeTab === 'company'"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              ></div>
            </button>
            <button
              @click="setTab('admin')"
              class="flex-1 flex items-center justify-center py-4 px-4 text-sm font-medium transition-colors relative"
              :class="activeTab === 'admin' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
            >
              <ShieldCheckIcon class="w-5 h-5 mr-2" />
              {{ t('auth.login.tabs.admin') }}
              <div
                v-if="activeTab === 'admin'"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              ></div>
            </button>
          </div>

          <!-- Card Body -->
          <div class="px-8 py-8">
            <!-- Company Login -->
            <div v-if="activeTab === 'company'">
              <CompanyLoginForm />

              <!-- Forgot Password -->
              <div class="mt-4 text-center">
                <RouterLink
                  to="/forgot-password"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {{ t('auth.login.forgotPassword') }}
                </RouterLink>
              </div>

              <!-- Divider -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    {{ t('auth.login.or') }}
                  </span>
                </div>
              </div>

              <!-- Register Link -->
              <div class="text-center">
                <p class="text-gray-600 dark:text-gray-400">
                  {{ t('auth.login.noAccount') }}
                  <RouterLink
                    to="/register"
                    class="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-1 transition-colors"
                  >
                    {{ t('auth.login.registerLink') }}
                  </RouterLink>
                </p>
              </div>
            </div>

            <!-- Admin Login -->
            <div v-else>
              <div class="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div class="flex items-start">
                  <ShieldCheckIcon class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 class="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      {{ t('auth.login.admin.info.title') }}
                    </h3>
                    <p class="text-sm text-amber-700 dark:text-amber-300">
                      {{ t('auth.login.admin.info.description') }}
                    </p>
                  </div>
                </div>
              </div>

              <AdminLoginForm />
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('auth.login.help.text') }}
            <a 
              href="mailto:support@mymove.de" 
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ t('auth.login.help.link') }}
            </a>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
