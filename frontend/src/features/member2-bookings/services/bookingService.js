// Member2 - Bathiya | Booking Management Module B
// bookingService.js — API service layer for all booking operations

const API_BASE =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) || "";
const BASE_URL = `${API_BASE}/api/bookings`;
export const RESOURCES_URL = `${API_BASE}/resources`;

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("accessToken") ||
    ""
  );
};

// Helper — shared fetch with error handling
const apiFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("paf:session-expired"));
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
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

// PATCH /api/bookings/:id — user updates their PENDING booking
export const updateBooking = async (id, updates) => {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
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
