import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { getAllTickets } from "../services/ticketService";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function countUnread(ticket) {
  return (ticket.notifications || []).filter((n) => !n.read).length;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getAllTickets();
      setTickets(list);
    } catch {
      setError("Unable to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return tickets
      .filter((t) => (statusFilter ? t.status === statusFilter : true))
      .filter((t) => {
        if (!kw) return true;
        return (
          String(t.id).includes(kw) ||
          (t.title || "").toLowerCase().includes(kw) ||
          (t.requesterEmail || "").toLowerCase().includes(kw) ||
          (t.location || "").toLowerCase().includes(kw)
        );
      });
  }, [tickets, statusFilter, keyword]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/60">
      <h2 className="text-xl font-semibold tracking-tight text-slate-50">
        Admin: Ticket Management
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Review all incident tickets, update status, and send replies/notifications
        to the requester.
      </p>
      <div className="mt-3">
        <Link
          to="/incidents/admin-resolved"
          className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Go to Resolved Section
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Filter by Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="" className="bg-slate-800">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-slate-800">
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Search (ID / Email / Title / Location)
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. projector, @example.com, #12"
            className="h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-slate-400">Loading tickets…</p>
      ) : (
        <div className="mt-6 overflow-auto">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">
              No tickets match your filters.
            </div>
          ) : (
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ticket
                  </th>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Requester
                  </th>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Title
                  </th>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </th>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="border-b border-slate-700 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="border-b border-slate-700 py-4">
                      <div className="text-sm font-semibold text-slate-50">
                        #{t.id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString()} • {t.category}
                      </div>
                      {countUnread(t) > 0 && (
                        <div className="mt-2 inline-flex items-center rounded-full border border-blue-600 bg-blue-900/50 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                          {countUnread(t)} new
                        </div>
                      )}
                    </td>
                    <td className="border-b border-slate-700 py-4">
                      <div className="text-sm text-slate-300">{t.requesterEmail}</div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Priority: {t.priority}
                      </div>
                    </td>
                    <td className="border-b border-slate-700 py-4">
                      <div className="text-sm text-slate-50">{t.title}</div>
                    </td>
                    <td className="border-b border-slate-700 py-4">
                      <div className="text-sm text-slate-300">{t.location}</div>
                    </td>
                    <td className="border-b border-slate-100 py-4">
                      <TicketStatusBadge status={t.status} />
                    </td>
                    <td className="border-b border-slate-100 py-4">
                      <Link
                        to={`/incidents/admin/${t.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

