import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './locales'

// Import global styles
import './style.css'

// Create Vue app instance
const app = createApp(App)

// Create Pinia store instance
const pinia = createPinia()

// Register plugins
app.use(pinia)      // State management
app.use(router)     // Routing
app.use(i18n)       // Internationalization

// Mount app to DOM
app.mount('#app')

// Log application startup
console.log('[MyMove] Application initialized successfully')
console.log('[MyMove] Environment:', import.meta.env.MODE)
