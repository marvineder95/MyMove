import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { messagesApi } from '@/api/messages'
import type { Conversation, Message } from '@/types'

export const useMessageStore = defineStore('message', () => {
  // ─── State ───
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const isSending = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMoreMessages = ref(false)

  // ─── Getters ───
  const sortedConversations = computed(() => {
    return [...conversations.value].sort((a, b) => {
      const aDate = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bDate = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bDate - aDate
    })
  })

  const messagesByDay = computed(() => {
    const groups: Record<string, Message[]> = {}
    for (const msg of messages.value) {
      const day = msg.createdAt.split('T')[0]
      if (!groups[day]) groups[day] = []
      groups[day].push(msg)
    }
    // Sort days ascending, messages within each day ascending
    const sorted: { day: string; messages: Message[] }[] = []
    for (const day of Object.keys(groups).sort()) {
      sorted.push({
        day,
        messages: groups[day].sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      })
    }
    return sorted
  })

  // ─── Actions ───
  async function fetchConversations(page = 1, limit = 20) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await messagesApi.getConversations(page, limit)
      conversations.value = data.data
      return data.data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load conversations'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMessages(conversationId: number, page = 1, limit = 50) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await messagesApi.getMessages(conversationId, page, limit)
      if (page === 1) {
        messages.value = data.data
      } else {
        messages.value = [...data.data, ...messages.value]
      }
      currentPage.value = page
      hasMoreMessages.value = data.meta.hasNextPage
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load messages'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(conversationId: number, content: string) {
    if (!content.trim()) return null
    isSending.value = true
    try {
      const { data } = await messagesApi.sendMessage(conversationId, { content })
      messages.value.push(data)
      // Update conversation lastMessageAt
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv) {
        conv.lastMessageAt = data.createdAt
        conv.latestMessage = data
      }
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to send message'
      return null
    } finally {
      isSending.value = false
    }
  }

  async function uploadFile(conversationId: number, file: File) {
    isUploading.value = true
    uploadProgress.value = 0
    try {
      // 1. Request presigned URL
      const { data: uploadData } = await messagesApi.requestFileUpload(
        conversationId,
        file.type,
        file.name,
        file.size,
      )

      // 2. Upload to S3
      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      uploadProgress.value = 100

      // 3. Confirm upload
      const { data: messageData } = await messagesApi.confirmFileUpload(conversationId, {
        s3Key: uploadData.s3Key,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
      })

      messages.value.push(messageData)

      // Update conversation preview
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv) {
        conv.lastMessageAt = messageData.createdAt
        conv.latestMessage = messageData
      }

      return messageData
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to upload file'
      return null
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  async function markRead(conversationId: number, messageIds: number[]) {
    if (messageIds.length === 0) return
    try {
      await messagesApi.markRead(conversationId, messageIds)
      for (const msg of messages.value) {
        if (messageIds.includes(msg.id)) {
          msg.isRead = true
        }
      }
    } catch {
      // Silently fail
    }
  }

  async function fetchUnreadCount() {
    try {
      const { data } = await messagesApi.getUnreadCount()
      unreadCount.value = data.count
      return data.count
    } catch {
      return 0
    }
  }

  function setCurrentConversation(conversation: Conversation | null) {
    currentConversation.value = conversation
  }

  function clearMessages() {
    messages.value = []
    currentPage.value = 1
    hasMoreMessages.value = false
  }

  return {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    isLoading,
    isSending,
    error,
    currentPage,
    hasMoreMessages,
    sortedConversations,
    messagesByDay,
    fetchConversations,
    fetchMessages,
    sendMessage,
    uploadFile,
    markRead,
    fetchUnreadCount,
    setCurrentConversation,
    clearMessages,
    isUploading,
    uploadProgress,
  }
})
