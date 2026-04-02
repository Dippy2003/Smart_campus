import React, { useMemo, useState } from "react";
import TicketListItem from "../components/TicketListItem";
import TicketThread from "../components/TicketThread";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { Link } from "react-router-dom";
import {
  getMyTickets,
  markTicketNotificationsRead,
  getLastRequesterEmail,
} from "../services/ticketService";

export default function MyTicketsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  const [openTicketId, setOpenTicketId] = useState(null);

  React.useEffect(() => {
    const lastEmail = getLastRequesterEmail();
    if (!email && lastEmail) {
      setEmail(lastEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    setLoading(true);
    setOpenTicketId(null);
    try {
      const list = await getMyTickets(email);
      setTickets(list);
    } catch {
      setError("Unable to load your tickets. Please try again.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

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
      setTickets(next);
    } catch {
      // Ignore read failure; ticket details can still show.
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg">
      <h2 className="text-xl font-semibold tracking-tight text-white">
        My Tickets
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Enter the email you used when reporting the incident. You will see your
        tickets, updates, and notifications here.
      </p>
      <div className="mt-3">
        <Link
          to="/incidents/my-resolved"
          className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Go to Resolved Section
        </Link>
      </div>

      <form onSubmit={fetchTickets} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <label className="w-full md:flex-1 grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Email *
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
            className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
          />
        </label>
        <button
          type="submit"
          className="inline-flex justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {submitted && !loading && tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-400">
          No tickets found for <span className="font-semibold text-white">{email}</span>.
          Create a new incident ticket first.
        </div>
      )}

      {tickets.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {tickets.length} ticket(s)
            </p>
            {unreadCount > 0 && (
              <div className="rounded-full border border-blue-600 bg-blue-900/50 px-3 py-1 text-xs font-semibold text-blue-300">
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

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
              {!openedTicket ? (
                <p className="text-sm text-slate-400">
                  Select a ticket to view its updates and notifications.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {openedTicket.title}
                      </h3>
                      <TicketStatusBadge status={openedTicket.status} />
                      <span className="rounded-full border border-slate-600 bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {openedTicket.category}
                      </span>
                      <span className="rounded-full border border-slate-600 bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        #{openedTicket.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Location: <span className="font-semibold text-white">{openedTicket.location}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted:{" "}
                      {new Date(openedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>

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

