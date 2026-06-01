import api from './index'
import type {
  Conversation,
  Message,
  PaginatedConversations,
  PaginatedMessages,
  SendMessagePayload,
} from '@/types'

export const messagesApi = {
  getConversations: (page = 1, limit = 20) =>
    api.get<PaginatedConversations>('/conversations', { params: { page, limit } }),

  getConversation: (id: number) =>
    api.get<Conversation>(`/conversations/${id}`),

  getMessages: (conversationId: number, page = 1, limit = 50) =>
    api.get<PaginatedMessages>(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),

  sendMessage: (conversationId: number, payload: SendMessagePayload) =>
    api.post<Message>(`/conversations/${conversationId}/messages`, payload),

  markRead: (conversationId: number, messageIds: number[]) =>
    api.patch(`/conversations/${conversationId}/read`, { messageIds }),

  getUnreadCount: () =>
    api.get<{ count: number }>('/conversations/unread-count'),

  requestFileUpload: (conversationId: number, fileType: string, fileName: string, fileSize?: number) =>
    api.post<{ uploadUrl: string; s3Key: string }>(`/conversations/${conversationId}/files`, {
      fileType,
      fileName,
      fileSize,
    }),

  confirmFileUpload: (conversationId: number, payload: { s3Key: string; fileType: string; fileName: string; fileSize: number }) =>
    api.post<Message & { fileUrl: string }>(`/conversations/${conversationId}/files/confirm`, payload),
}
