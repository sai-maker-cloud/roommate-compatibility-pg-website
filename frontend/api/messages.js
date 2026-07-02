import { apiClient } from "./client.js";

export const getMessages = async (receiverId) => {
  const { data } = await apiClient.get(`/api/messages/${receiverId}`);
  return data;
};

export const getConversationMessages = async (conversationId) => {
  const { data } = await apiClient.get(`/api/messages/conversation/${conversationId}`);
  return data;
};
