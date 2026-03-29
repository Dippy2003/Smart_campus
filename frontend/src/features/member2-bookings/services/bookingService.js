const BASE_URL = "http://localhost:8080/api/bookings";
export const RESOURCES_URL = "http://localhost:8080/resources";

export const createBooking = async (bookingData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create booking");
  return data;
};

export const getMyBookings = async (email) => {
  const res = await fetch(`${BASE_URL}/my?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

export const getAllBookings = async (status = "") => {
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

export const approveBooking = async (id, reason = "") => {
  const res = await fetch(`${BASE_URL}/${id}/approve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to approve");
  return data;
};

export const rejectBooking = async (id, reason = "") => {
  const res = await fetch(`${BASE_URL}/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to reject");
  return data;
};

export const cancelBooking = async (id, email) => {
  const res = await fetch(`${BASE_URL}/${id}/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel");
  return data;
};