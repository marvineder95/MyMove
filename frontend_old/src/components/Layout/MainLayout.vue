<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <main class="flex-1 pt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RouterView v-slot="{ Component }">
          <Transition
            name="page"
            mode="out-in"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

const { locale } = useI18n()
const themeStore = useThemeStore()

// Initialize theme and locale on mount
onMounted(() => {
  // Initialize theme
  themeStore.initTheme()

  // Initialize locale from localStorage
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['de', 'en'].includes(savedLocale)) {
    locale.value = savedLocale
  }
})
</script>

<style scoped>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
