import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/api/settings'
import type { User } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  async function loadSettings() {
    isLoading.value = true
    error.value = null
    success.value = false
    try {
      const { data } = await settingsApi.getSettings()
      user.value = data.user
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Einstellungen konnten nicht geladen werden'
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(payload: { emailNewOffers?: boolean; emailOfferUpdates?: boolean; emailReminders?: boolean }) {
    isSaving.value = true
    error.value = null
    success.value = false
    try {
      const { data } = await settingsApi.updateSettings(payload)
      user.value = data.user
      success.value = true
      setTimeout(() => { success.value = false }, 3000)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Speichern fehlgeschlagen'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function updatePreferences(payload: { locale?: string; preferredMovingDays?: string; preferredServices?: string }) {
    isSaving.value = true
    error.value = null
    success.value = false
    try {
      const { data } = await settingsApi.updatePreferences(payload)
      user.value = data.user
      success.value = true
      setTimeout(() => { success.value = false }, 3000)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Speichern fehlgeschlagen'
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    user,
    isLoading,
    isSaving,
    error,
    success,
    loadSettings,
    updateSettings,
    updatePreferences,
  }
})
