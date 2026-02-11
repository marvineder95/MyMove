<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: 'md',
  hover: false
})

const paddingClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  return paddings[props.padding]
})

const shadowClasses = computed(() => {
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg shadow-gray-200/50 dark:shadow-black/30',
    lg: 'shadow-xl shadow-gray-200/50 dark:shadow-black/40'
  }
  return shadows[props.shadow]
})

const classes = computed(() => {
  return [
    'relative rounded-2xl overflow-hidden',
    'bg-white/80 dark:bg-slate-800/80',
    'backdrop-blur-md',
    'border border-gray-100 dark:border-slate-700/50',
    paddingClasses.value,
    shadowClasses.value,
    props.hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]'
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div :class="classes">
    <!-- Optional gradient overlay for glassmorphism effect -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"
    />
    
    <!-- Content -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
