import { apiClient } from "./client.js";

export const getConversations = async () => {
  const { data } = await apiClient.get("/api/conversations");
  return data;
};

export const getOrCreateConversation = async (userId) => {
  const { data } = await apiClient.post("/api/conversations", { userId });
  return data;
};
