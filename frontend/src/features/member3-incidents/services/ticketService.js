const STORAGE_KEY = "smart-campus-incident-tickets-v1";
const LAST_EMAIL_KEY = "smart-campus-last-incident-email-v1";
const API_BASE_URL = "http://localhost:8080/api/incidents";

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
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to create ticket");
    return data;
  } catch {
    return createTicketLocal(payload);
  }
}

export async function getAllTickets() {
  try {
    const res = await fetch(API_BASE_URL);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch tickets");
    return data;
  } catch {
    return getAllTicketsLocal();
  }
}

export async function getMyTickets(email) {
  const safeEmail = String(email || "").trim();
  try {
    const res = await fetch(
      `${API_BASE_URL}/my?email=${encodeURIComponent(safeEmail)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch tickets");
    return data;
  } catch {
    return getMyTicketsLocal(safeEmail);
  }
}

export async function getTechnicianTickets(email) {
  const safeEmail = String(email || "").trim();
  try {
    const res = await fetch(
      `${API_BASE_URL}/technician?email=${encodeURIComponent(safeEmail)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch technician tickets");
    return data;
  } catch {
    const norm = safeEmail.toLowerCase();
    return getAllTicketsLocal().filter(
      (t) => String(t.assignedTechnician || "").toLowerCase() === norm
    );
  }
}

export async function getRegisteredTechnicians() {
  try {
    const res = await fetch(`${API_BASE_URL}/technicians`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to fetch technicians");
    return Array.isArray(data) ? data : [];
  } catch {
    return [
      {
        email: "electrician@campus.lk",
        name: "Campus Electrician",
        specialty: "ELECTRICAL",
      },
      {
        email: "plumber@campus.lk",
        name: "Campus Plumber",
        specialty: "PLUMBING",
      },
      {
        email: "engineer@campus.lk",
        name: "Building Engineer",
        specialty: "CONSTRUCTION",
      },
    ];
  }
}

export async function getTicketById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Ticket not found");
    return data;
  } catch {
    return getTicketByIdLocal(id);
  }
}

export async function updateTicketStatus(id, status, assignedTechnician, solutionNote) {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, assignedTechnician, solutionNote }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to update status");
    return data;
  } catch {
    return updateTicketStatusLocal(id, status, assignedTechnician, solutionNote);
  }
}

export async function addAdminReply({ id, replyMessage, sendNotification }) {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyMessage, sendNotification }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to send reply");
    return data;
  } catch {
    return addAdminReplyLocal({ id, replyMessage, sendNotification });
  }
}

export async function markTicketNotificationsRead({ id, email }) {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}/notifications/read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to mark notifications");
    return data;
  } catch {
    return markTicketNotificationsReadLocal({ id, email });
  }
}

