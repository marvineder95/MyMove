<script setup lang="ts">
import CompanySidebar from './CompanySidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <CompanySidebar />
    <main class="lg:ml-60 min-w-0">
      <slot />
    </main>
  </div>
</template>
