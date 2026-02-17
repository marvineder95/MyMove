<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: File | null
  label?: string
  accept?: string
  maxSize?: number // in MB
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  maxSize: 10
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const formattedFileSize = computed(() => {
  if (!props.modelValue) return ''
  const sizeInBytes = props.modelValue.size
  if (sizeInBytes < 1024) return `${sizeInBytes} B`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
})

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndEmit(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    validateAndEmit(files[0])
  }
}

const validateAndEmit = (file: File) => {
  const maxSizeInBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    // File too large - could emit error event
    return
  }
  emit('update:modelValue', file)
}

const handleClick = () => {
  fileInputRef.value?.click()
}

const handleRemove = () => {
  emit('update:modelValue', null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {{ $t(label) }}
    </label>
    
    <!-- Drag & Drop Zone -->
    <div
      v-if="!modelValue"
      :class="[
        'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
        'bg-gray-50 dark:bg-slate-800/50',
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="handleClick"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <!-- Upload Icon -->
      <div class="mx-auto w-12 h-12 mb-4 text-gray-400 dark:text-gray-500">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('auth.register.fields.dragDrop') }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {{ $t('common.maxSize', { size: maxSize + 'MB' }) }}
      </p>
    </div>
    
    <!-- Selected File Display -->
    <div
      v-else
      class="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
    >
      <div class="flex items-center space-x-3">
        <!-- File Icon -->
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
            {{ modelValue.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formattedFileSize }}
          </p>
        </div>
      </div>
      
      <!-- Remove Button -->
      <button
        type="button"
        class="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
        @click="handleRemove"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    
    <p
      v-if="error"
      class="mt-1.5 text-sm text-red-500 dark:text-red-400 animate-pulse"
    >
      {{ error }}
    </p>
  </div>
</template>
