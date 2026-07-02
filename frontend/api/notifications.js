import { apiClient } from "./client.js";

export const getNotifications = async () => {
  const { data } = await apiClient.get("/api/notifications");
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await apiClient.get("/api/notifications/unread-count");
  return data.count;
};

export const markAsRead = async (id) => {
  const { data } = await apiClient.put(`/api/notifications/${id}/read`);
  return data;
};

export const markAllRead = async () => {
  const { data } = await apiClient.put("/api/notifications/read-all");
  return data;
};
