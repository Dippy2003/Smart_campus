import React, { useState } from "react";
import { Link } from "react-router-dom";
import TicketListItem from "../components/TicketListItem";
import { getMyTickets, getLastRequesterEmail } from "../services/ticketService";

function isResolvedStatus(status) {
  return status === "RESOLVED" || status === "CLOSED";
}

export default function MyResolvedTicketsPage() {
  const [email, setEmail] = useState(getLastRequesterEmail() || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);

  const fetchResolved = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setError("");
    try {
      const all = await getMyTickets(email);
      setTickets(all.filter((t) => isResolvedStatus(t.status)));
    } catch {
      setError("Unable to load resolved tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            My Resolved Tickets
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            View tickets that are resolved or closed.
          </p>
        </div>
        <Link
          to="/incidents/my"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to My Active Tickets
        </Link>
      </div>

      <form onSubmit={fetchResolved} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <label className="w-full md:flex-1 grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Email *
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>
        <button
          type="submit"
          className="inline-flex justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        >
          {loading ? "Loading..." : "Show Resolved"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {submitted && !loading && tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          No resolved tickets found for this email.
        </div>
      )}

      {tickets.length > 0 && (
        <div className="mt-6 space-y-4">
          {tickets.map((t) => (
            <TicketListItem key={t.id} ticket={t} onOpen={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

