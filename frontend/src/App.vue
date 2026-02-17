<template>
  <v-app>
    <router-view />
    
    <!-- Global Snackbar for errors -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn variant="text" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore, useCustomerStore, useCompanyStore, useAdminStore } from '@/stores'

const authStore = useAuthStore()
const customerStore = useCustomerStore()
const companyStore = useCompanyStore()
const adminStore = useAdminStore()

const showError = ref(false)
const errorMessage = ref('')

// Watch for errors in all stores
watch(() => authStore.error, (err) => {
  if (err) {
    errorMessage.value = err
    showError.value = true
    authStore.clearError()
  }
})

watch(() => customerStore.wizardError, (err) => {
  if (err) {
    errorMessage.value = err
    showError.value = true
    customerStore.wizardError = null
  }
})

watch(() => companyStore.error, (err) => {
  if (err) {
    errorMessage.value = err
    showError.value = true
    companyStore.clearError()
  }
})

watch(() => adminStore.error, (err) => {
  if (err) {
    errorMessage.value = err
    showError.value = true
    adminStore.clearError()
  }
})
</script>

<style>
/* Global styles */
html {
  overflow-y: auto;
}
</style>
