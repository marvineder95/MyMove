<template>
  <div class="max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">{{ t('video.title') }}</h1>
    <p class="text-gray-600 mb-6">{{ t('video.description') }}</p>

    <div class="card space-y-6">
      <div>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="fileInput?.click()"
          class="btn-secondary w-full py-4 border-2 border-dashed border-gray-300"
          :disabled="isUploading"
        >
          {{ selectedFile ? selectedFile.name : t('video.selectFile') }}
        </button>
      </div>

      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all"
          :style="{ width: uploadProgress + '%' }"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-if="success" class="text-sm text-green-600">{{ t('video.success') }}</p>

      <div class="flex gap-3">
        <button
          @click="upload"
          class="btn-primary"
          :disabled="!selectedFile || isUploading"
        >
          {{ isUploading ? t('video.uploading') : t('video.upload') }}
        </button>
        <RouterLink :to="`/moves/${route.params.id}/inventory`" class="btn-secondary">
          {{ t('common.next') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { requestsApi } from '@/api/requests'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const requestId = Number(route.params.id)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref(false)

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
  error.value = ''
}

async function upload() {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadProgress.value = 0
  error.value = ''

  try {
    // 1. Get presigned URL from backend
    const { data: presigned } = await requestsApi.initiateVideo(requestId)

    // 2. Upload directly to S3
    await fetch(presigned.uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type || 'video/mp4' },
    })

    uploadProgress.value = 100

    // 3. Confirm upload to backend
    await requestsApi.confirmVideo(requestId, presigned.videoId)
    success.value = true

    setTimeout(() => {
      router.push(`/moves/${requestId}/inventory`)
    }, 1500)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message || t('video.error')
  } finally {
    isUploading.value = false
  }
}
</script>
