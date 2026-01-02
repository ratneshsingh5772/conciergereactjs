import api from '../../services/api';

export interface ChatMessage {
  id: number;
  userId: string;
  userMessage: string;
  agentResponse: string;
  createdAt: string;
  messageType?: string;
}

export interface ChatStats {
  totalMessages: number;
  sessionActive: boolean;
  lastActivity: string;
}

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  const response = await api.get<{ success: boolean; data: ChatMessage[] }>(`/chat/history/${userId}`);
  return response.data.data;
};

export const getChatStats = async (userId: string): Promise<ChatStats> => {
  const response = await api.get<{ success: boolean; data: ChatStats }>(`/chat/stats/${userId}`);
  return response.data.data;
};

export const resetChatSession = async (userId: string): Promise<void> => {
  await api.post('/chat/reset', { userId });
};
