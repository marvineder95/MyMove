import { createPinia } from 'pinia'

// Export all stores
export { useAuthStore } from './auth'
export { useOfferStore } from './offer'
export { useInventoryStore } from './inventory'
export { useAiStore } from './ai'
export { usePricingStore } from './pricing'
export { useNotificationStore } from './notification'
export { useThemeStore } from './theme'

// Export API instance
export { api } from './api'

// Create and export pinia instance
export const pinia = createPinia()

export default pinia
