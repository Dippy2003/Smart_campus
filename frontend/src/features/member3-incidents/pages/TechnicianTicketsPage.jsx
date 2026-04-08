import React, { useMemo, useState } from "react";
import TicketListItem from "../components/TicketListItem";
import TicketThread from "../components/TicketThread";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { getTechnicianTickets, updateTicketStatus } from "../services/ticketService";

function isActiveStatus(status) {
  return !["RESOLVED", "CLOSED", "CANCELLED", "REJECTED"].includes(status);
}

export default function TechnicianTicketsPage() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openTicketId, setOpenTicketId] = useState(null);

  const fetchTickets = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);
    setError("");
    setOpenTicketId(null);
    try {
      const list = await getTechnicianTickets(email);
      setTickets(list.filter((t) => isActiveStatus(t.status)));
    } catch {
      setError("Unable to load assigned tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openedTicket = useMemo(
    () => tickets.find((t) => t.id === openTicketId) || null,
    [tickets, openTicketId]
  );

  const changeStatus = async (status) => {
    if (!openedTicket) return;
    const updated = await updateTicketStatus(
      openedTicket.id,
      status,
      null,
      openedTicket.solutionNote || ""
    );
    setTickets((prev) =>
      prev.map((t) => (t.id === openedTicket.id ? updated : t)).filter((t) => isActiveStatus(t.status))
    );
    setOpenTicketId(updated && isActiveStatus(updated.status) ? updated.id : null);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/60">
      <h2 className="text-xl font-semibold tracking-tight text-slate-50">
        Technician Dashboard
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        See and manage only tickets assigned to your technician account.
      </p>

      <form onSubmit={fetchTickets} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <label className="w-full md:flex-1 grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Technician Email *
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="electrician@campus.lk"
            className="h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>
        <button
          type="submit"
          className="inline-flex justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
        >
          {loading ? "Loading..." : "Show My Tickets"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {submitted && !loading && tickets.length === 0 && (
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {!openedTicket ? (
              <p className="text-sm text-slate-600">Select a ticket to manage status.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{openedTicket.title}</h3>
                  <TicketStatusBadge status={openedTicket.status} />
                </div>
                <p className="text-xs text-slate-600">{openedTicket.description}</p>
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
                <TicketThread updates={openedTicket.updates} notifications={openedTicket.notifications} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
