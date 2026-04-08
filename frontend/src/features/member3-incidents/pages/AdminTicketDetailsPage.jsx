import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketThread from "../components/TicketThread";
import {
  addAdminReply,
  getTicketById,
  getRegisteredTechnicians,
  updateTicketStatus,
} from "../services/ticketService";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED", "REJECTED"];

export default function AdminTicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("OPEN");
  const [replyMessage, setReplyMessage] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [solutionNote, setSolutionNote] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [sendNotification, setSendNotification] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = useMemo(() => {
    return (ticket?.notifications || []).filter((n) => !n.read).length;
  }, [ticket]);

  const load = async () => {
    const t = await getTicketById(ticketId);
    setTicket(t);
    if (t) {
      setStatus(t.status);
      setAssignedTechnician(t.assignedTechnician || "");
      setSolutionNote(t.solutionNote || "");
    }
  };

  useEffect(() => {
    load();
    getRegisteredTechnicians().then(setTechnicians).catch(() => setTechnicians([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const handleSaveStatus = async () => {
    setError("");
    setSavingStatus(true);
    try {
      const updated = await updateTicketStatus(
        ticketId,
        status,
        assignedTechnician,
        solutionNote
      );
      if (!updated) throw new Error("Ticket not found");
      setTicket(updated);
      if (
        updated.status === "RESOLVED" ||
        updated.status === "CLOSED" ||
        updated.status === "REJECTED"
      ) {
        navigate("/incidents/admin-resolved");
      } else if (updated.status === "CANCELLED") {
        navigate("/incidents/admin-cancelled");
      }
    } catch (err) {
      setError("Could not update status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSendReply = async () => {
    setError("");
    if (!replyMessage.trim()) {
      setError("Reply message cannot be empty.");
      return;
    }

    setSendingReply(true);
    try {
      const updated = await addAdminReply({
        id: ticketId,
        replyMessage,
        sendNotification,
      });
      if (!updated) throw new Error("Ticket not found");
      setTicket(updated);
      setReplyMessage("");
    } catch {
      setError("Could not send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Ticket not found. It may have been removed.
        </p>
        <div className="mt-4">
          <Link
            to="/incidents/admin"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Admin Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Manage Ticket #{ticket.id}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {ticket.category}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {unreadCount} new notification(s)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/incidents/admin"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </Link>
            <Link
              to="/incidents/admin-resolved"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Resolved Section
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Requester
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {ticket.requesterEmail}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Submitted: {new Date(ticket.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Priority: {ticket.priority}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Location
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {ticket.location}
            </p>
            <p className="mt-3 text-xs text-slate-600">
              Current status is visible to the requester.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Title
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {ticket.title}
          </p>
          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
            {ticket.description}
          </p>
          {ticket.attachments?.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Attachments
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ticket.attachments.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noreferrer">
                    <img
                      src={img}
                      alt={`Ticket attachment ${idx + 1}`}
                      className="h-16 w-16 rounded-lg border border-slate-300 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            Update Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              type="button"
              disabled={savingStatus}
              onClick={handleSaveStatus}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingStatus ? "Saving..." : "Save Status"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            Assigned Technician
            <select
              value={assignedTechnician}
              onChange={(e) => setAssignedTechnician(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">Unassigned</option>
              {technicians.map((t) => (
                <option key={t.email} value={t.email}>
                  {t.name} ({t.specialty}) - {t.email}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            Solution Note
            <textarea
              value={solutionNote}
              onChange={(e) => setSolutionNote(e.target.value)}
              rows={2}
              placeholder="Final fix / solution details"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Send Reply / Notification
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Your reply is sent to the requester&apos;s email (when the server has
          SMTP configured) and appears in the ticket timeline. Use the checkbox
          below to also add an in-app notification for them.
        </p>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
          <label className="w-full grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            Reply Message
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="Write a clear update for the requester. Example: 'We have scheduled a technician visit for tomorrow 10:00 AM.'"
            />
          </label>

          <div className="flex flex-col gap-3 md:ml-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
              />
              <span className="text-xs font-semibold text-slate-700">
                Also add in-app notification
              </span>
            </label>

            <button
              type="button"
              disabled={sendingReply}
              onClick={handleSendReply}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sendingReply ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>
      </div>

      <TicketThread updates={ticket.updates} notifications={ticket.notifications} />
    </div>
  );
}

