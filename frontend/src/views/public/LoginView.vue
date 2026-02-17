<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-title>MyMove</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/">Zurück</v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-6">
              <v-card-title class="text-h5 text-center mb-6">
                Anmelden
              </v-card-title>

              <v-form @submit.prevent="handleLogin" ref="form">
                <!-- Role Selection -->
                <v-btn-toggle
                  v-model="selectedRole"
                  mandatory
                  divided
                  class="mb-6 d-flex"
                >
                  <v-btn value="CUSTOMER" class="flex-1">
                    <v-icon start>mdi-account</v-icon>
                    Kunde
                  </v-btn>
                  <v-btn value="COMPANY" class="flex-1">
                    <v-icon start>mdi-domain</v-icon>
                    Firma
                  </v-btn>
                  <v-btn value="ADMIN" class="flex-1">
                    <v-icon start>mdi-shield-account</v-icon>
                    Admin
                  </v-btn>
                </v-btn-toggle>

                <!-- Email -->
                <v-text-field
                  v-model="email"
                  label="E-Mail"
                  type="email"
                  required
                  :rules="[v => !!v || 'E-Mail erforderlich']"
                  prepend-inner-icon="mdi-email"
                  class="mb-4"
                />

                <!-- Password -->
                <v-text-field
                  v-model="password"
                  label="Passwort"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :rules="[v => !!v || 'Passwort erforderlich']"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-6"
                />

                <!-- Company ID (for company login) -->
                <v-text-field
                  v-if="selectedRole === 'COMPANY'"
                  v-model="companyId"
                  label="Firmen-ID (optional für Demo)"
                  prepend-inner-icon="mdi-identifier"
                  class="mb-6"
                />

                <!-- Error Alert -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4"
                  closable
                  @click:close="error = ''"
                >
                  {{ error }}
                </v-alert>

                <!-- Submit -->
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!email || !password"
                >
                  Anmelden
                </v-btn>

                <!-- Register Link -->
                <div class="text-center mt-4">
                  <p class="text-body-2 text-medium-emphasis">
                    Noch kein Konto?
                  </p>
                  <v-btn
                    variant="text"
                    size="small"
                    to="/register/customer"
                    class="mr-2"
                  >
                    Als Kunde registrieren
                  </v-btn>
                  <v-btn
                    variant="text"
                    size="small"
                    to="/register/company"
                  >
                    Als Firma registrieren
                  </v-btn>
                </div>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type { Role } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<any>(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const selectedRole = ref<Role>('CUSTOMER')
const companyId = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  const valid = await form.value?.validate()
  if (!valid?.valid) return

  loading.value = true
  error.value = ''

  try {
    // Test the connection first
    await authApi.ping()
    
    // For demo purposes, we just store the credentials
    // In production, you'd verify against a login endpoint
    const success = await authStore.login(
      { email: email.value, password: password.value },
      selectedRole.value,
      companyId.value || undefined
    )

    if (success) {
      // Redirect based on role
      if (selectedRole.value === 'ADMIN') {
        router.push('/admin')
      } else if (selectedRole.value === 'COMPANY') {
        router.push('/company')
      } else {
        router.push('/customer')
      }
    }
  } catch (err: any) {
    // If ping fails, still allow login for demo
    if (err.response?.status === 401 || err.message?.includes('Network Error')) {
      // For demo: proceed with login anyway
      await authStore.login(
        { email: email.value, password: password.value },
        selectedRole.value,
        companyId.value || undefined
      )
      
      if (selectedRole.value === 'ADMIN') {
        router.push('/admin')
      } else if (selectedRole.value === 'COMPANY') {
        router.push('/company')
      } else {
        router.push('/customer')
      }
    } else {
      error.value = err.response?.data?.message || 'Anmeldung fehlgeschlagen'
    }
  } finally {
    loading.value = false
  }
}

// Import authApi for ping test
import { authApi } from '@/api'
</script>
