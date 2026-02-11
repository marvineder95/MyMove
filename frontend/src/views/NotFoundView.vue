<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { 
  HomeIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RouterLink to="/" class="flex items-center space-x-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <HomeIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MyMove
          </span>
        </RouterLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-lg text-center">
        <!-- 404 Illustration -->
        <div class="relative mb-8">
          <!-- Background decoration -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-48 h-48 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl"></div>
          </div>
          
          <!-- 404 Icon -->
          <div class="relative">
            <div class="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <span class="text-5xl font-bold text-white">404</span>
            </div>
            <!-- Floating elements -->
            <div class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center animate-bounce">
              <QuestionMarkCircleIcon class="w-6 h-6 text-white" />
            </div>
            <div class="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center animate-pulse">
              <MagnifyingGlassIcon class="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <!-- Content -->
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('notFound.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {{ t('notFound.description') }}
        </p>

        <!-- Suggestions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('notFound.suggestions.title') }}
          </h3>
          <ul class="space-y-3 text-left">
            <li class="flex items-start">
              <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span class="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
              </div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('notFound.suggestions.checkUrl') }}</span>
            </li>
            <li class="flex items-start">
              <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span class="text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
              </div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('notFound.suggestions.goHome') }}</span>
            </li>
            <li class="flex items-start">
              <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span class="text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
              </div>
              <span class="text-gray-600 dark:text-gray-400">{{ t('notFound.suggestions.contact') }}</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/"
            class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <HomeIcon class="w-5 h-5 mr-2" />
            {{ t('notFound.actions.home') }}
          </RouterLink>
          <button
            @click="$router.back()"
            class="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            {{ t('notFound.actions.back') }}
          </button>
        </div>

        <!-- Help Links -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {{ t('notFound.help.text') }}
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <RouterLink
              to="/contact"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {{ t('notFound.help.contact') }}
            </RouterLink>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <RouterLink
              to="/faq"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {{ t('notFound.help.faq') }}
            </RouterLink>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <RouterLink
              to="/support"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {{ t('notFound.help.support') }}
            </RouterLink>
          </div>
        </div>

        <!-- Error Code -->
        <div class="mt-8">
          <code class="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 font-mono">
            Error Code: 404_NOT_FOUND
          </code>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} MyMove. {{ t('common.allRightsReserved') }}
        </p>
      </div>
    </footer>
  </div>
</template>
