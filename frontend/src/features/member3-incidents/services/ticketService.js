const STORAGE_KEY = "smart-campus-incident-tickets-v1";
const LAST_EMAIL_KEY = "smart-campus-last-incident-email-v1";
// Dev: relative /api → src/setupProxy.js → :8080. Prod: set REACT_APP_API_BASE_URL or default below.
function resolveIncidentApiBase() {
  if (typeof process === "undefined") return "http://localhost:8080";
  const explicit = process.env.REACT_APP_API_BASE_URL;
  if (explicit != null && String(explicit).trim() !== "") {
    return String(explicit).trim().replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "";
  }
  return "http://localhost:8080";
}

const API_BASE = resolveIncidentApiBase();
const API_BASE_URL = API_BASE
  ? `${API_BASE}/api/incidents`.replace(/([^:])\/{2,}/g, "$1/")
  : "/api/incidents";

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("accessToken") ||
    ""
  );
}

async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...authHeader,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("paf:session-expired"));
    const err = new Error("Session expired");
    err.isAuthFailure = true;
    throw err;
  }
  return res;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readTickets() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeTickets(tickets) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function nextId(tickets) {
  const max = tickets.reduce((acc, t) => Math.max(acc, Number(t.id) || 0), 0);
  return max + 1;
}

function nextUpdateId(ticket) {
  const max = (ticket.updates || []).reduce(
    (acc, u) => Math.max(acc, Number(u.id) || 0),
    0
  );
  return max + 1;
}

function nextNotificationId(ticket) {
  const max = (ticket.notifications || []).reduce(
    (acc, n) => Math.max(acc, Number(n.id) || 0),
    0
  );
  return max + 1;
}

function createTicketLocal({
  requesterEmail,
  title,
  description,
  ticketType,
  category,
  location,
  priority,
  attachments,
}) {
  const tickets = readTickets();
  const id = nextId(tickets);
  const now = new Date().toISOString();

  const newTicket = {
    id,
    requesterEmail: requesterEmail.trim().toLowerCase(),
    title: title.trim(),
    description: description.trim(),
    ticketType,
    category,
    location: location.trim(),
    priority,
    status: "OPEN",
    createdAt: now,
    assignedTechnician: null,
    solutionNote: null,
    attachments: Array.isArray(attachments) ? attachments.slice(0, 3) : [],
    updates: [
      {
        id: 1,
        authorType: "REQUESTER",
        message: "Ticket submitted successfully.",
        createdAt: now,
      },
    ],
    notifications: [
      {
        id: 1,
        message: "We received your ticket. You can track updates from My Tickets.",
        createdAt: now,
        read: false,
      },
    ],
  };

  window.localStorage.setItem(LAST_EMAIL_KEY, newTicket.requesterEmail);
  const next = [newTicket, ...tickets];
  writeTickets(next);
  return newTicket;
}

function getAllTicketsLocal() {
  return readTickets();
}

function getMyTicketsLocal(email) {
  const norm = (email || "").trim().toLowerCase();
  return readTickets().filter((t) => t.requesterEmail === norm);
}

function getTicketByIdLocal(id) {
  const ticketId = Number(id);
  return readTickets().find((t) => Number(t.id) === ticketId) || null;
}

function updateTicketStatusLocal(id, status, assignedTechnician, solutionNote) {
  const tickets = readTickets();
  const ticketId = Number(id);
  const idx = tickets.findIndex((t) => Number(t.id) === ticketId);
  if (idx === -1) return null;

  tickets[idx] = {
    ...tickets[idx],
    status,
    assignedTechnician: assignedTechnician?.trim() || null,
    solutionNote: solutionNote?.trim() || null,
    updates: [
      ...(tickets[idx].updates || []),
      {
        id: nextUpdateId(tickets[idx]),
        authorType: "ADMIN",
        message:
          `Status changed to ${status}.` +
          (assignedTechnician?.trim()
            ? ` Technician assigned: ${assignedTechnician.trim()}.`
            : "") +
          (solutionNote?.trim() ? ` Solution: ${solutionNote.trim()}` : ""),
        createdAt: new Date().toISOString(),
      },
    ],
  };

  writeTickets(tickets);
  return tickets[idx];
}

function addAdminReplyLocal({ id, replyMessage, sendNotification }) {
  const tickets = readTickets();
  const ticketId = Number(id);
  const idx = tickets.findIndex((t) => Number(t.id) === ticketId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const nextTicket = { ...tickets[idx] };

  nextTicket.updates = [
    ...(nextTicket.updates || []),
    {
      id: nextUpdateId(nextTicket),
      authorType: "ADMIN",
      message: replyMessage.trim(),
      createdAt: now,
    },
  ];

  if (sendNotification) {
    nextTicket.notifications = [
      ...(nextTicket.notifications || []),
      {
        id: nextNotificationId(nextTicket),
        message: `Update on your ticket #${nextTicket.id}: ${replyMessage.trim()}`,
        createdAt: now,
        read: false,
      },
    ];
  }

  const nextTickets = tickets.slice();
  nextTickets[idx] = nextTicket;
  writeTickets(nextTickets);
  return nextTicket;
}

function isResolvedDeletableStatus(status) {
  return status === "RESOLVED" || status === "CLOSED" || status === "REJECTED";
}

function deleteTicketLocal(id) {
  const tickets = readTickets();
  const ticketId = Number(id);
  const idx = tickets.findIndex((t) => Number(t.id) === ticketId);
  if (idx === -1) return false;
  if (!isResolvedDeletableStatus(tickets[idx].status)) return false;
  const next = tickets.filter((_, i) => i !== idx);
  writeTickets(next);
  return true;
}

function markTicketNotificationsReadLocal({ id, email }) {
  const tickets = readTickets();
  const ticketId = Number(id);
  const norm = (email || "").trim().toLowerCase();
  const idx = tickets.findIndex(
    (t) => Number(t.id) === ticketId && t.requesterEmail === norm
  );
  if (idx === -1) return null;

  const ticket = { ...tickets[idx] };
  ticket.notifications = (ticket.notifications || []).map((n) => ({
    ...n,
    read: true,
  }));

  const nextTickets = tickets.slice();
  nextTickets[idx] = ticket;
  writeTickets(nextTickets);
  return ticket;
}

export function getLastRequesterEmail() {
  const raw = window.localStorage.getItem(LAST_EMAIL_KEY);
  return raw || "";
}

export async function createTicket({
  requesterEmail,
  title,
  description,
  ticketType,
  category,
  location,
  priority,
  attachments,
}) {
  const payload = {
    requesterEmail,
    title,
    description,
    ticketType,
    category,
    location,
    priority,
    attachments: Array.isArray(attachments) ? attachments.slice(0, 3) : [],
  };

  window.localStorage.setItem(LAST_EMAIL_KEY, String(requesterEmail || "").trim().toLowerCase());

  try {
    const res = await authFetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to create ticket");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return createTicketLocal(payload);
  }
}

export async function getAllTickets() {
  try {
    const res = await authFetch(API_BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch tickets");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return getAllTicketsLocal();
  }
}

export async function getMyTickets(email) {
  const safeEmail = String(email || "").trim();
  try {
    const res = await authFetch(
      `${API_BASE_URL}/my?email=${encodeURIComponent(safeEmail)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch tickets");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return getMyTicketsLocal(safeEmail);
  }
}

export async function getTechnicianTickets(email) {
  const safeEmail = String(email || "").trim();
  try {
    const res = await authFetch(
      `${API_BASE_URL}/technician?email=${encodeURIComponent(safeEmail)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch technician tickets");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    const norm = safeEmail.toLowerCase();
    return getAllTicketsLocal().filter(
      (t) => String(t.assignedTechnician || "").toLowerCase() === norm
    );
  }
}

export async function getRegisteredTechnicians() {
  try {
    const res = await authFetch(`${API_BASE_URL}/technicians`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch technicians");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return [
      {
        email: "electrician@campus.lk",
        name: "Campus Electrician",
        specialty: "ELECTRICAL",
        accountType: "TECHNICIAN",
      },
      {
        email: "plumber@campus.lk",
        name: "Campus Plumber",
        specialty: "PLUMBING",
        accountType: "TECHNICIAN",
      },
      {
        email: "engineer@campus.lk",
        name: "Building Engineer",
        specialty: "CONSTRUCTION",
        accountType: "TECHNICIAN",
      },
    ];
  }
}

export async function getTicketById(id) {
  try {
    const res = await authFetch(`${API_BASE_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Ticket not found");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return getTicketByIdLocal(id);
  }
}

export async function updateTicketStatus(id, status, assignedTechnician, solutionNote) {
  try {
    const res = await authFetch(`${API_BASE_URL}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, assignedTechnician, solutionNote }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to update status");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return updateTicketStatusLocal(id, status, assignedTechnician, solutionNote);
  }
}

export async function addAdminReply({ id, replyMessage, sendNotification }) {
  try {
    const res = await authFetch(`${API_BASE_URL}/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyMessage, sendNotification }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to send reply");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return addAdminReplyLocal({ id, replyMessage, sendNotification });
  }
}

export async function deleteResolvedTicket(id) {
  try {
    const res = await authFetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    if (res.status === 204) return true;
    if (!res.ok) {
      await res.json().catch(() => null);
      return false;
    }
    return true;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return deleteTicketLocal(id);
  }
}

export async function markTicketNotificationsRead({ id, email }) {
  try {
    const res = await authFetch(`${API_BASE_URL}/${id}/notifications/read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to mark notifications");
    return data;
  } catch (e) {
    if (e?.isAuthFailure) throw e;
    return markTicketNotificationsReadLocal({ id, email });
  }
}

