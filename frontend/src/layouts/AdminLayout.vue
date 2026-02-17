<template>
  <v-layout class="fill-height">
    <!-- App Bar -->
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>MyMove - Administration</v-app-bar-title>
      
      <v-spacer />
      
      <v-btn variant="text" to="/admin" prepend-icon="mdi-view-dashboard">
        Dashboard
      </v-btn>
      
      <v-btn variant="text" @click="logout" prepend-icon="mdi-logout">
        Abmelden
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/')
}
</script>
