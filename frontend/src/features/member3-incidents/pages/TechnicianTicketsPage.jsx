import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TicketListItem from "../components/TicketListItem";
import TicketThread from "../components/TicketThread";
import TicketStatusBadge from "../components/TicketStatusBadge";
import {
  addAdminReply,
  getTechnicianTickets,
  updateTicketStatus,
} from "../services/ticketService";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

function isActiveStatus(status) {
  return !["RESOLVED", "CLOSED", "CANCELLED", "REJECTED"].includes(status);
}

export default function TechnicianTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const email = user?.email || "";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openTicketId, setOpenTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const list = await getTechnicianTickets(email);
      const active = list.filter((t) => isActiveStatus(t.status));
      setTickets(active);
      setOpenTicketId((current) =>
        active.some((t) => t.id === current) ? current : active[0]?.id || null
      );
    } catch {
      const msg = "Unable to load assigned tickets.";
      setError(msg);
      toast.error(msg);
      setTickets([]);
      setOpenTicketId(null);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (authLoading || !email) return;
    fetchTickets();
  }, [authLoading, email, fetchTickets]);

  useEffect(() => {
    if (authLoading || !email) return undefined;
    const intervalId = window.setInterval(() => {
      fetchTickets();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [authLoading, email, fetchTickets]);

  const openedTicket = useMemo(
    () => tickets.find((t) => t.id === openTicketId) || null,
    [tickets, openTicketId]
  );

  const changeStatus = async (status) => {
    if (!openedTicket) return;
    try {
      const updated = await updateTicketStatus(
        openedTicket.id,
        status,
        openedTicket.assignedTechnician || email,
        openedTicket.solutionNote || ""
      );
      if (!updated) throw new Error("Ticket not found");
      toast.success(`Status updated to ${status}.`);
      setTickets((prev) =>
        prev
          .map((t) => (t.id === openedTicket.id ? updated : t))
          .filter((t) => isActiveStatus(t.status))
      );
      setOpenTicketId(
        updated && isActiveStatus(updated.status) ? updated.id : null
      );
    } catch {
      toast.error("Could not update ticket status.");
    }
  };

  const handleSendReply = async () => {
    if (!openedTicket) return;
    const message = replyMessage.trim();
    if (!message) {
      toast.error("Please write a message for the user.");
      return;
    }
    setSendingReply(true);
    try {
      const updated = await addAdminReply({
        id: openedTicket.id,
        replyMessage: `Technician update: ${message}`,
        sendNotification: true,
      });
      if (!updated) throw new Error("Ticket not found");
      setTickets((prev) =>
        prev.map((t) => (t.id === openedTicket.id ? updated : t))
      );
      setReplyMessage("");
      toast.success("Message sent to user.");
    } catch {
      toast.error("Could not send message to user.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/60">
      <h2 className="text-xl font-semibold tracking-tight text-slate-50">
        Technician Dashboard
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        See and manage only tickets assigned to your technician account.
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Logged in as: <span className="font-semibold text-slate-200">{email || "-"}</span>
      </p>

      <div className="mt-5">
        <button
          type="button"
          onClick={fetchTickets}
          className="inline-flex justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || authLoading || !email}
        >
          {loading ? "Loading..." : "Refresh My Assigned Tickets"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && tickets.length === 0 && email && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">
          No active assigned tickets found.
        </div>
      )}

      {tickets.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,1.25fr]">
          <div className="space-y-4">
            {tickets.map((t) => (
              <TicketListItem key={t.id} ticket={t} onOpen={() => setOpenTicketId(t.id)} />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            {!openedTicket ? (
              <p className="text-sm text-slate-300">Select a ticket to manage status.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-50">{openedTicket.title}</h3>
                  <TicketStatusBadge status={openedTicket.status} />
                </div>
                <p className="text-xs text-slate-300">{openedTicket.description}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => changeStatus("IN_PROGRESS")} className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">
                    Mark In Progress
                  </button>
                  <button type="button" onClick={() => changeStatus("RESOLVED")} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Mark Resolved
                  </button>
                  <button type="button" onClick={() => changeStatus("CLOSED")} className="rounded-full bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white">
                    Mark Closed
                  </button>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Message to User
                  </p>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    placeholder="Example: I will visit your location by 3 PM. Please keep the area accessible."
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={sendingReply}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingReply ? "Sending..." : "Send Update to User"}
                    </button>
                  </div>
                </div>
                <TicketThread updates={openedTicket.updates} notifications={openedTicket.notifications} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
