/**
 * notificationService.js – Member 4 (Module D)
 * Mirrors the Spring Boot REST endpoints:
 *   GET  /api/notifications          → fetchNotifications()
 *   PUT  /api/notifications/:id/read → markAsRead(id)
 *
 * Demo mode uses localStorage to simulate a live backend.
 * Set VITE_API_BASE_URL in your .env to switch to real API.
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";
const USE_MOCK  = !BASE_URL;

/* ── Mock Data ────────────────────────────────────────────────── */
const MOCK_KEY = "paf-notifications";

const SEED = [
  { id: 1, type: "BOOKING_APPROVED", title: "Booking Approved",      message: "Your booking for Lab Room 3 on Monday 9 AM has been approved.",                       read: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 2, type: "BOOKING_REJECTED", title: "Booking Rejected",      message: "Your booking for Conference Room A was rejected due to a schedule conflict.",          read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, type: "TICKET_UPDATED",   title: "Ticket Status Changed", message: "Ticket #1042 status changed to IN_PROGRESS by a technician.",                         read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, type: "COMMENT_ADDED",    title: "New Comment",           message: "A technician commented on ticket #1042: 'We will fix it by tomorrow.'",               read: true,  createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, type: "BOOKING_APPROVED", title: "Booking Approved",      message: "Your booking for Study Pod 7 on Friday 2 PM has been approved.",                      read: true,  createdAt: new Date(Date.now() - 86400000).toISOString() },
];

function getMock() {
  try { const s = localStorage.getItem(MOCK_KEY); if (s) return JSON.parse(s); } catch { /* */ }
  localStorage.setItem(MOCK_KEY, JSON.stringify(SEED));
  return SEED;
}
function saveMock(data) { localStorage.setItem(MOCK_KEY, JSON.stringify(data)); }
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function authHeaders() {
  const user = JSON.parse(localStorage.getItem("paf-auth-user") || "null");
  return { "Content-Type": "application/json", ...(user ? { Authorization: `Bearer ${user.id}` } : {}) };
}

/* ── Public API ───────────────────────────────────────────────── */
export async function fetchNotifications() {
  if (USE_MOCK) { await delay(300); return getMock(); }
  const res = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markAsRead(id) {
  if (USE_MOCK) {
    await delay(150);
    const data = getMock().map((n) => n.id === id ? { ...n, read: true } : n);
    saveMock(data);
    return data.find((n) => n.id === id);
  }
  const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, { method: "PUT", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

export async function markAllAsRead() {
  if (USE_MOCK) { await delay(200); const data = getMock().map((n) => ({ ...n, read: true })); saveMock(data); return data; }
  const all = await fetchNotifications();
  await Promise.all(all.filter((n) => !n.read).map((n) => markAsRead(n.id)));
  return fetchNotifications();
}

export async function triggerDemoNotification(type = "BOOKING_APPROVED") {
  const MAP = {
    BOOKING_APPROVED: { title: "Booking Approved",     message: "Your latest booking has been approved!" },
    BOOKING_REJECTED: { title: "Booking Rejected",     message: "Your latest booking was rejected." },
    TICKET_UPDATED:   { title: "Ticket Status Changed",message: "Your ticket status was just updated." },
    COMMENT_ADDED:    { title: "New Comment",           message: "Someone commented on your ticket." },
  };
  const data = getMock();
  const n = { id: Date.now(), type, ...MAP[type], read: false, createdAt: new Date().toISOString() };
  saveMock([n, ...data]);
  return n;
}

/* ── Helpers ──────────────────────────────────────────────────── */
export function formatTimeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const NOTIFICATION_META = {
  BOOKING_APPROVED: { icon: "✅", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  BOOKING_REJECTED: { icon: "❌", cls: "text-red-700 bg-red-50 border-red-200" },
  TICKET_UPDATED:   { icon: "🔧", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  COMMENT_ADDED:    { icon: "💬", cls: "text-blue-700 bg-blue-50 border-blue-200" },
};
