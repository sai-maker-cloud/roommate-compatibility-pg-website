import { apiClient } from "./client.js";
import { normalizeBooking } from "../utils/normalizers.js";

export const bookPG = async ({ pgId, moveInDate }) => {
  const { data } = await apiClient.post("/api/bookings/book", { pgId, moveInDate });
  return {
    ...data,
    booking: normalizeBooking(data.booking),
  };
};

export const acceptBooking = async (id, status = "accepted") => {
  const { data } = await apiClient.put(`/api/bookings/accept/${id}`, { status });
  return normalizeBooking(data);
};

export const getOwnerBookings = async () => {
  const { data } = await apiClient.get("/api/bookings/owner");
  return data.map(normalizeBooking);
};

export const getUserBookings = async () => {
  const { data } = await apiClient.get("/api/bookings");
  return data.map(normalizeBooking);
};

