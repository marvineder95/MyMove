import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import { useAuthStore } from './stores/auth'
import './style.css'
import App from './App.vue'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // Restore auth session before routing so protected routes work after hard reload
  const authStore = useAuthStore()
  if (authStore.token) {
    try {
      await authStore.fetchUser()
    } catch {
      // fetchUser already calls logout on failure
    }
  }

  app.use(router)
  app.use(i18n)

  app.mount('#app')
}

bootstrap()
