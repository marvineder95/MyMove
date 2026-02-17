import { createI18n } from 'vue-i18n'
import de from './de.json'
import en from './en.json'

// Type definitions for message schema
export type MessageSchema = typeof de

// Define available locales
export type AvailableLocales = 'de' | 'en'

export const availableLocales: AvailableLocales[] = ['de', 'en']

export const defaultLocale: AvailableLocales = 'de'

// Create i18n instance
const i18n = createI18n<[MessageSchema], AvailableLocales>({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    de,
    en
  },
  // Enable global injection for $t function
  globalInjection: true,
  // Use composition API
  allowComposition: true
})

export default i18n

// Helper function to get current locale
export function getCurrentLocale(): AvailableLocales {
  return i18n.global.locale.value as AvailableLocales
}

// Helper function to set locale
export function setLocale(locale: AvailableLocales): void {
  if (availableLocales.includes(locale)) {
    i18n.global.locale.value = locale
    // Store preference in localStorage
    localStorage.setItem('locale', locale)
  }
}

// Helper function to initialize locale from localStorage
export function initializeLocale(): void {
  const storedLocale = localStorage.getItem('locale') as AvailableLocales
  if (storedLocale && availableLocales.includes(storedLocale)) {
    i18n.global.locale.value = storedLocale
  }
}
