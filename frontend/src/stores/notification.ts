import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])

  // Getters
  const hasNotifications = computed(() => notifications.value.length > 0)
  const notificationCount = computed(() => notifications.value.length)

  // Actions
  const generateId = (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = (): void => {
    notifications.value = []
  }

  // Convenience methods
  const success = (message: string, duration?: number): string => {
    return addNotification({ type: 'success', message, duration })
  }

  const error = (message: string, duration?: number): string => {
    return addNotification({ type: 'error', message, duration })
  }

  const warning = (message: string, duration?: number): string => {
    return addNotification({ type: 'warning', message, duration })
  }

  const info = (message: string, duration?: number): string => {
    return addNotification({ type: 'info', message, duration })
  }

  return {
    // State
    notifications,
    // Getters
    hasNotifications,
    notificationCount,
    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,
    // Convenience methods
    success,
    error,
    warning,
    info
  }
})
