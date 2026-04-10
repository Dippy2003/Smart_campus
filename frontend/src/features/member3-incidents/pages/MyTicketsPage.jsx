import React, { useCallback, useMemo, useState } from "react";
import TicketListItem from "../components/TicketListItem";
import TicketThread from "../components/TicketThread";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getMyTickets,
  markTicketNotificationsRead,
} from "../services/ticketService";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

function isActiveStatus(status) {
  return !["RESOLVED", "CLOSED", "CANCELLED", "REJECTED"].includes(status);
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const email = user?.email ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  const [openTicketId, setOpenTicketId] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!email) return;
    setError("");
    setSubmitted(true);
    setLoading(true);
    setOpenTicketId(null);
    try {
      const list = await getMyTickets(email);
      setTickets(list.filter((t) => isActiveStatus(t.status)));
    } catch {
      const msg = "Unable to load your tickets. Please try again.";
      setError(msg);
      toast.error(msg);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [email]);

  React.useEffect(() => {
    if (authLoading) return;
    if (!email) {
      setTickets([]);
      setSubmitted(false);
      return;
    }
    fetchTickets();
  }, [email, authLoading, fetchTickets]);

  React.useEffect(() => {
    if (authLoading || !email) return undefined;
    const intervalId = window.setInterval(() => {
      fetchTickets();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [email, authLoading, fetchTickets]);

  const unreadCount = useMemo(() => {
    return tickets.reduce(
      (acc, t) => acc + (t.notifications || []).filter((n) => !n.read).length,
      0
    );
  }, [tickets]);

  const openedTicket = useMemo(() => {
    return tickets.find((t) => t.id === openTicketId) || null;
  }, [tickets, openTicketId]);

  const handleOpen = async (ticket) => {
    setOpenTicketId(ticket.id);
    try {
      await markTicketNotificationsRead({ id: ticket.id, email });
      const next = await getMyTickets(email);
      setTickets(next.filter((t) => isActiveStatus(t.status)));
    } catch {
      // Ignore read failure; ticket details can still show.
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/60">
      <h2 className="text-xl font-semibold tracking-tight text-slate-50">
        My Tickets
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Your tickets are loaded automatically from your logged-in account.
      </p>
      <div className="mt-3">
        <Link
          to="/incidents/my-resolved"
          className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Resolved Tickets
        </Link>
        <Link
          to="/incidents/my-cancelled"
          className="ml-2 inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Cancelled Tickets
        </Link>
      </div>

      {!authLoading && !email && (
        <div className="mt-6 rounded-2xl border border-amber-700 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
          Please sign in to view your tickets.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {submitted && !loading && tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">
          No tickets found for <span className="font-semibold text-white">{email}</span>.
          Create a new incident ticket first.
        </div>
      )}

      {tickets.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {tickets.length} ticket(s)
            </p>
            {unreadCount > 0 && (
              <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                {unreadCount} new notification(s)
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr,1.25fr]">
            <div className="space-y-4">
              {tickets.map((t) => (
                <TicketListItem
                  key={t.id}
                  ticket={t}
                  onOpen={() => handleOpen(t)}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              {!openedTicket ? (
                <p className="text-sm text-slate-300">
                  Select a ticket to view its updates and notifications.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-50">
                        {openedTicket.title}
                      </h3>
                      <TicketStatusBadge status={openedTicket.status} />
                      <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        {openedTicket.category}
                      </span>
                      <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        #{openedTicket.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Location: <span className="font-semibold">{openedTicket.location}</span>
                    </p>
                    <p className="text-xs text-slate-300">
                      Submitted:{" "}
                      {new Date(openedTicket.createdAt).toLocaleString()}
                    </p>
                    {openedTicket.assignedTechnician && (
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                        <p>
                          Technician:{" "}
                          <span className="font-semibold">
                            {openedTicket.assignedTechnician}
                          </span>
                        </p>
                        <p className="mt-1">They will contact you soon.</p>
                      </div>
                    )}
                    {openedTicket.solutionNote && (
                      <p className="text-xs text-slate-300">
                        Solution:{" "}
                        <span className="font-semibold">
                          {openedTicket.solutionNote}
                        </span>
                      </p>
                    )}
                  </div>

                  {openedTicket.attachments?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Attachments
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {openedTicket.attachments.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noreferrer">
                            <img
                              src={img}
                              alt={`Attachment ${idx + 1}`}
                              className="h-14 w-14 rounded-md border border-slate-600 object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <TicketThread
                    updates={openedTicket.updates}
                    notifications={openedTicket.notifications}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

