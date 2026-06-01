<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, h, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/message'
import { useAuthStore } from '@/stores/auth'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'
import CompanyLayout from '@/components/company/CompanyLayout.vue'
import type { Conversation } from '@/types'

const { t } = useI18n()
const messageStore = useMessageStore()
const authStore = useAuthStore()

const isCompany = computed(() => authStore.isCompany)
const mySenderType = computed(() => isCompany.value ? 'COMPANY' : 'CUSTOMER')
const otherSenderType = computed(() => isCompany.value ? 'CUSTOMER' : 'COMPANY')

// ─── Layout State ───
const showMobileChat = ref(false)
const messageInput = ref('')
const contactWarning = ref('')
const showContactWarning = ref(false)
const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
const chatScrollRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// ─── Contact Detection ───
const contactPatterns = [
  { type: 'Telefonnummer', regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/ },
  { type: 'E-Mail', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { type: 'WhatsApp', regex: /(?:wa\.me|whatsapp\.com|whatsapp)\/\d+|whatsapp:\+?\d+/i },
  { type: 'Telegram', regex: /(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]+|@[a-zA-Z0-9_]{5,}/ },
]

function detectContactInfo(text: string): string[] {
  const detected: string[] = []
  for (const pattern of contactPatterns) {
    if (pattern.regex.test(text)) {
      detected.push(pattern.type)
    }
  }
  return detected
}

function onInputChange() {
  const detected = detectContactInfo(messageInput.value)
  if (detected.length > 0) {
    contactWarning.value = t('messages.contactWarning', { types: detected.join(', ') })
    showContactWarning.value = true
  } else {
    showContactWarning.value = false
  }
}

// ─── Helpers ───
function getContactName(conv: Conversation): string {
  if (isCompany.value) {
    const name = conv.customer
      ? `${conv.customer.firstName} ${conv.customer.lastName}`
      : null
    return name || t('messages.unknownCustomer')
  }
  return conv.company?.companyName || t('messages.unknownCompany')
}

function getContactInitial(conv: Conversation): string {
  if (isCompany.value) {
    return conv.customer?.firstName?.charAt(0) || '?'
  }
  return conv.company?.companyName?.charAt(0) || '?'
}

// ─── Selection ───
function selectConversation(conv: Conversation) {
  messageStore.setCurrentConversation(conv)
  messageStore.clearMessages()
  showMobileChat.value = true
  messageStore.fetchMessages(conv.id)
  // Mark unread messages from the OTHER side as read
  const unreadIds = messageStore.messages
    .filter((m) => !m.isRead && m.senderType === otherSenderType.value)
    .map((m) => m.id)
  if (unreadIds.length > 0) {
    messageStore.markRead(conv.id, unreadIds)
  }
}

function backToList() {
  showMobileChat.value = false
  messageStore.setCurrentConversation(null)
}

// ─── Send Message ───
async function sendMessage() {
  const content = messageInput.value.trim()
  if (!content || !messageStore.currentConversation) return

  const detected = detectContactInfo(content)
  if (detected.length > 0) {
    contactWarning.value = t('messages.contactWarning', { types: detected.join(', ') })
    showContactWarning.value = true
    return
  }

  await messageStore.sendMessage(messageStore.currentConversation.id, content)
  messageInput.value = ''
  showContactWarning.value = false
  await nextTick()
  scrollToBottom()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// ─── File Upload ───
function triggerFileInput() {
  fileInputRef.value?.click()
}

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !messageStore.currentConversation) return

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    contactWarning.value = t('messages.fileTooLarge')
    showContactWarning.value = true
    target.value = ''
    return
  }

  showContactWarning.value = false
  await messageStore.uploadFile(messageStore.currentConversation.id, file)
  target.value = ''
  await nextTick()
  scrollToBottom()
}

// ─── Scroll ───
function scrollToBottom() {
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
  }
}

// ─── Polling ───
function startPolling() {
  if (pollingInterval.value) clearInterval(pollingInterval.value)
  pollingInterval.value = setInterval(async () => {
    if (messageStore.currentConversation) {
      await messageStore.fetchMessages(messageStore.currentConversation.id, 1)
    }
    await messageStore.fetchUnreadCount()
  }, 10000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// ─── Formatters ───
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return t('messages.today')
  if (dateStr === yesterday) return t('messages.yesterday')
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatRoute(address: string): string {
  const parts = address.split(',').map((s) => s.trim())
  return parts.slice(0, 2).join(', ')
}

// ─── Lifecycle ───
onMounted(() => {
  messageStore.fetchConversations()
  messageStore.fetchUnreadCount()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

watch(() => messageStore.messages, () => {
  nextTick(scrollToBottom)
}, { deep: true })

// ─── Icons ───
function ArrowLeftIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm12 19-7-7 7-7' }),
    h('path', { d: 'M19 12H5' }),
  ])
}
function SendIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm22 2-7 20-4-9-9-4 20-7z' }),
    h('path', { d: 'M22 2 11 13' }),
  ])
}
function PaperclipIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48' }),
  ])
}
function CheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '20 6 9 17 4 12' }),
  ])
}
function DoubleCheckIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('polyline', { points: '18 6 7 17 2 12' }),
    h('polyline', { points: '22 10 11 21 6 16' }),
  ])
}
function MapPinIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    h('circle', { cx: '12', cy: '10', r: '3' }),
  ])
}
function CalendarIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
  ])
}

function ShieldIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  ])
}
function AlertIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
    h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
  ])
}

function BuildingIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M12 10h.01' }),
    h('path', { d: 'M12 14h.01' }),
    h('path', { d: 'M12 6h.01' }),
    h('path', { d: 'M16 10h.01' }),
    h('path', { d: 'M16 14h.01' }),
    h('path', { d: 'M16 6h.01' }),
    h('path', { d: 'M8 10h.01' }),
    h('path', { d: 'M8 14h.01' }),
    h('path', { d: 'M8 6h.01' }),
    h('path', { d: 'M9 22v-3h6v3' }),
    h('path', { d: 'M8 22h8' }),
    h('rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2' }),
  ])
}

function FileIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
  ])
}

function DownloadIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    h('polyline', { points: '7 10 12 15 17 10' }),
    h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
  ])
}

function PackageIcon(props: { class?: string }) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: props.class }, [
    h('path', { d: 'm7.5 4.27 9 5.15' }),
    h('path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }),
    h('path', { d: 'm3.3 7 8.7 5 8.7-5' }),
    h('path', { d: 'M12 22V12' }),
  ])
}
</script>

<template>
  <component :is="isCompany ? CompanyLayout : CustomerLayout">
    <div class="h-[calc(100vh-4rem)] flex bg-white">
      <!-- ─── LEFT: Conversation List ─── -->
      <div
        :class="[
          'w-full lg:w-80 border-r border-gray-200 flex flex-col bg-gray-50/50',
          showMobileChat ? 'hidden lg:flex' : 'flex',
        ]"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <h1 class="text-lg font-bold text-gray-900">{{ t('messages.title') }}</h1>
            <span v-if="messageStore.unreadCount > 0" class="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {{ messageStore.unreadCount }}
            </span>
          </div>
        </div>

        <!-- Conversations -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="messageStore.isLoading && messageStore.conversations.length === 0" class="p-8 text-center text-sm text-gray-500">
            {{ t('common.loading') }}
          </div>
          <div v-else-if="messageStore.conversations.length === 0" class="p-8 text-center text-sm text-gray-500">
            {{ t('messages.noConversations') }}
          </div>

          <div
            v-for="conv in messageStore.sortedConversations"
            :key="conv.id"
            @click="selectConversation(conv)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
              messageStore.currentConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'border-l-4 border-l-transparent',
            ]"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-sm font-bold text-primary-700">
                {{ getContactInitial(conv) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ getContactName(conv) }}</p>
                  <span v-if="conv.lastMessageAt" class="text-xs text-gray-400 shrink-0">{{ formatTime(conv.lastMessageAt) }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 truncate">
                  <span v-if="conv.moveRequest">{{ formatRoute(conv.moveRequest.originAddress) }} → {{ formatRoute(conv.moveRequest.destinationAddress) }}</span>
                </p>
                <p class="text-xs text-gray-400 mt-1 truncate">
                  {{ conv.latestMessage?.content || '' }}
                </p>
              </div>
              <div v-if="conv.unreadCount" class="shrink-0">
                <span class="bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {{ conv.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── CENTER: Chat Area ─── -->
      <div
        :class="[
          'flex-1 flex flex-col min-w-0',
          showMobileChat ? 'flex' : 'hidden lg:flex',
        ]"
      >
        <!-- Chat Header -->
        <div class="h-14 border-b border-gray-200 flex items-center px-4 gap-3 bg-white shrink-0">
          <button v-if="showMobileChat" @click="backToList" class="lg:hidden p-1 text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div v-if="messageStore.currentConversation" class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
              {{ getContactInitial(messageStore.currentConversation) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ getContactName(messageStore.currentConversation) }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                <span v-if="messageStore.currentConversation.moveRequest">
                  {{ formatRoute(messageStore.currentConversation.moveRequest.originAddress) }} → {{ formatRoute(messageStore.currentConversation.moveRequest.destinationAddress) }}
                </span>
              </p>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            {{ t('messages.selectConversation') }}
          </div>
        </div>

        <!-- Messages -->
        <div ref="chatScrollRef" class="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
          <div v-if="!messageStore.currentConversation" class="h-full flex items-center justify-center text-gray-400 text-sm">
            {{ t('messages.selectConversation') }}
          </div>
          <template v-else>
            <!-- Request Summary Header -->
            <div v-if="messageStore.currentConversation.moveRequest" class="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PackageIcon class="w-4 h-4 text-primary-600" />
                <h4 class="text-sm font-semibold text-gray-900">{{ t('messages.requestSummary') }}</h4>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-500 text-xs">{{ t('wizard.summary.from') }}</span>
                  <p class="text-gray-900 truncate">{{ formatRoute(messageStore.currentConversation.moveRequest.originAddress) }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-xs">{{ t('wizard.summary.to') }}</span>
                  <p class="text-gray-900 truncate">{{ formatRoute(messageStore.currentConversation.moveRequest.destinationAddress) }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-xs">{{ t('wizard.summary.date') }}</span>
                  <p class="text-gray-900">{{ messageStore.currentConversation.moveRequest.moveDate }}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-xs">{{ t('messages.status') }}</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {{ messageStore.currentConversation.moveRequest.status }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="messageStore.isLoading && messageStore.messages.length === 0" class="text-center text-sm text-gray-500 py-8">
              {{ t('common.loading') }}
            </div>
            <div v-else-if="messageStore.messages.length === 0" class="text-center text-sm text-gray-500 py-8">
              {{ t('messages.noMessages') }}
            </div>
            <template v-else>
              <div v-for="dayGroup in messageStore.messagesByDay" :key="dayGroup.day" class="space-y-3">
                <!-- Day separator -->
                <div class="flex items-center justify-center">
                  <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ formatDay(dayGroup.day) }}</span>
                </div>

                <!-- Messages in day -->
                <div v-for="msg in dayGroup.messages" :key="msg.id" class="flex" :class="[
                  msg.senderType === 'SYSTEM' ? 'justify-center' :
                  msg.senderType === mySenderType ? 'justify-end' : 'justify-start'
                ]">
                  <!-- System Message -->
                  <div v-if="msg.senderType === 'SYSTEM'" class="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 max-w-md">
                    <BuildingIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <span class="text-xs text-gray-600">{{ msg.content }}</span>
                    <span class="text-[10px] text-gray-400 shrink-0">{{ formatTime(msg.createdAt) }}</span>
                  </div>

                  <!-- File Message -->
                  <div v-else-if="msg.messageType === 'FILE'" :class="[
                    'max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-2.5',
                    msg.senderType === mySenderType
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                  ]">
                    <a
                      :href="msg.fileUrl || '#'
"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <FileIcon class="w-5 h-5 shrink-0" :class="msg.senderType === mySenderType ? 'text-primary-200' : 'text-gray-500'" />
                      <span class="text-sm truncate">{{ msg.content }}</span>
                      <DownloadIcon class="w-4 h-4 shrink-0" :class="msg.senderType === mySenderType ? 'text-primary-200' : 'text-gray-500'" />
                    </a>
                    <div class="flex items-center justify-end gap-1 mt-1">
                      <span :class="['text-[10px]', msg.senderType === mySenderType ? 'text-primary-200' : 'text-gray-400']">
                        {{ formatTime(msg.createdAt) }}
                      </span>
                      <CheckIcon v-if="msg.senderType === mySenderType && !msg.isRead" class="w-3 h-3 text-primary-300" />
                      <DoubleCheckIcon v-if="msg.senderType === mySenderType && msg.isRead" class="w-3 h-3 text-primary-300" />
                    </div>
                  </div>

                  <!-- User/Company Message -->
                  <div v-else :class="[
                    'max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-2.5',
                    msg.senderType === mySenderType
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                  ]">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
                    <div class="flex items-center justify-end gap-1 mt-1">
                      <span :class="['text-[10px]', msg.senderType === mySenderType ? 'text-primary-200' : 'text-gray-400']">
                        {{ formatTime(msg.createdAt) }}
                      </span>
                      <CheckIcon v-if="msg.senderType === mySenderType && !msg.isRead" class="w-3 h-3 text-primary-300" />
                      <DoubleCheckIcon v-if="msg.senderType === mySenderType && msg.isRead" class="w-3 h-3 text-primary-300" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- Input Area -->
        <div v-if="messageStore.currentConversation" class="border-t border-gray-200 p-3 bg-white shrink-0">
          <!-- Contact Warning -->
          <div v-if="showContactWarning" class="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertIcon class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800">{{ contactWarning }}</p>
          </div>

          <div class="flex items-end gap-2">
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              @change="onFileSelected"
            />
            <button
              @click="triggerFileInput"
              :disabled="messageStore.isUploading"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0 disabled:opacity-50"
            >
              <PaperclipIcon class="w-5 h-5" />
            </button>
            <div class="flex-1 min-w-0">
              <textarea
                v-model="messageInput"
                @keydown="handleKeydown"
                @input="onInputChange"
                :placeholder="t('messages.inputPlaceholder')"
                rows="1"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none max-h-32"
                style="min-height: 40px;"
              />
            </div>
            <button
              @click="sendMessage"
              :disabled="!messageInput.trim() || messageStore.isSending || messageStore.isUploading"
              :class="[
                'p-2.5 rounded-xl transition-colors shrink-0',
                messageInput.trim() && !messageStore.isUploading
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              ]"
            >
              <SendIcon class="w-5 h-5" />
            </button>
          </div>
          <!-- Upload progress -->
          <div v-if="messageStore.isUploading" class="mt-2">
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                :style="{ width: messageStore.uploadProgress + '%' }"
              />
            </div>
            <p class="text-[10px] text-gray-400 mt-0.5 text-center">{{ t('messages.uploading') }}</p>
          </div>
          <p class="text-[10px] text-gray-400 mt-1.5 text-center">
            <ShieldIcon class="w-3 h-3 inline mr-1" />
            {{ t('messages.securityNote') }}
          </p>
        </div>
      </div>

      <!-- ─── RIGHT: Move Details ─── -->
      <div class="hidden xl:flex w-80 border-l border-gray-200 flex-col bg-gray-50/50">
        <div v-if="messageStore.currentConversation?.moveRequest" class="p-4 space-y-4 overflow-y-auto">
          <h3 class="text-sm font-bold text-gray-900">{{ t('messages.moveDetails') }}</h3>

          <!-- Status -->
          <div class="bg-white rounded-lg border border-gray-200 p-3">
            <p class="text-xs text-gray-500 mb-1">{{ t('messages.status') }}</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {{ messageStore.currentConversation.moveRequest.status }}
            </span>
          </div>

          <!-- Route -->
          <div class="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
            <div class="flex items-start gap-2">
              <MapPinIcon class="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-gray-500">{{ t('wizard.summary.from') }}</p>
                <p class="text-sm text-gray-900">{{ messageStore.currentConversation.moveRequest.originAddress }}</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <MapPinIcon class="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-gray-500">{{ t('wizard.summary.to') }}</p>
                <p class="text-sm text-gray-900">{{ messageStore.currentConversation.moveRequest.destinationAddress }}</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <CalendarIcon class="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p class="text-xs text-gray-500">{{ t('wizard.summary.date') }}</p>
                <p class="text-sm text-gray-900">{{ messageStore.currentConversation.moveRequest.moveDate }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2">
            <button class="w-full py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
              {{ t('messages.viewOffer') }}
            </button>
            <button class="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
              {{ t('messages.viewInventory') }}
            </button>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center text-sm text-gray-400 p-4">
          {{ t('messages.selectConversation') }}
        </div>
      </div>
    </div>
  </component>
</template>
