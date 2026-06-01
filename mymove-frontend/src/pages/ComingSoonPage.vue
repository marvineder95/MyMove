<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'

const route = useRoute()
const { t } = useI18n()

const title = route.meta.title as string || t('comingSoon.title')
</script>

<template>
  <CustomerLayout>
    <div class="max-w-3xl mx-auto p-6">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h1>
        <p class="text-gray-500">{{ t('comingSoon.subtitle') }}</p>
      </div>
    </div>
  </CustomerLayout>
</template>
