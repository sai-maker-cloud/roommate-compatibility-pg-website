import { apiClient } from "./client.js";
import { normalizePg } from "../utils/normalizers.js";

export const getPGs = async () => {
  const { data } = await apiClient.get("/api/pg");
  return data.map(normalizePg);
};

export const addPG = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "images") {
      Array.from(value || []).forEach((file) => formData.append("images", file));
      return;
    }

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => formData.append(key, item));
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const { data } = await apiClient.post("/api/pg/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizePg(data);
};

export const updateRooms = async (id, available) => {
  const { data } = await apiClient.put(`/api/pg/rooms/${id}`, { available });
  return normalizePg(data);
};

export const getPGsByOwner = async (userId) => {
  const { data } = await apiClient.get(`/api/pg/owner/${userId}`);
  return data.map(normalizePg);
};

export const updatePg = async (id, payload) => {
  const { data } = await apiClient.put(`/api/pg/${id}`, payload);
  return normalizePg(data);
};

export const deletePg = async (id) => {
  const { data } = await apiClient.delete(`/api/pg/${id}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await apiClient.get("/api/pg/dashboard/stats");
  return data;
};

export const ratePg = async (id, score) => {
  const { data } = await apiClient.post(`/api/pg/${id}/rate`, { score });
  return data;
};

