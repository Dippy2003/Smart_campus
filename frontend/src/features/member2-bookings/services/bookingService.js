// Member2 - Bathiya | Booking Management Module B
// bookingService.js — API service layer for all booking operations

const BASE_URL = "http://localhost:8080/api/bookings";
export const RESOURCES_URL = "http://localhost:8080/resources";

// Helper — shared fetch with error handling
const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

// POST /api/bookings — create new booking
export const createBooking = async (bookingData) => {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
};

// GET /api/bookings/my?email= — get current user's bookings
export const getMyBookings = async (email) => {
  return apiFetch(`${BASE_URL}/my?email=${encodeURIComponent(email)}`);
};

// GET /api/bookings — get all bookings, optional status filter (admin)
export const getAllBookings = async (status = "") => {
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL;
  return apiFetch(url);
};

// GET /api/bookings/stats — get booking counts by status
export const getBookingStats = async () => {
  return apiFetch(`${BASE_URL}/stats`);
};

// GET /api/bookings/:id — get single booking
export const getBookingById = async (id) => {
  return apiFetch(`${BASE_URL}/${id}`);
};

// PUT /api/bookings/:id/approve — admin approves booking
export const approveBooking = async (id, reason = "") => {
  return apiFetch(`${BASE_URL}/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};

// PUT /api/bookings/:id/reject — admin rejects booking
export const rejectBooking = async (id, reason = "") => {
  return apiFetch(`${BASE_URL}/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};

// PUT /api/bookings/:id/cancel — user cancels their own booking
export const cancelBooking = async (id, email) => {
  return apiFetch(`${BASE_URL}/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ email }),
  });
};
