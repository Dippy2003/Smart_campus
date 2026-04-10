import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { getAllTickets } from "../services/ticketService";

function isCancelledStatus(status) {
  return status === "CANCELLED";
}

export default function AdminCancelledTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await getAllTickets();
      setTickets(all.filter((t) => isCancelledStatus(t.status)));
    } catch {
      toast.error("Unable to load cancelled tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/60">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-50">
            Admin: Cancelled Tickets
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Tickets moved out of active workflow as cancelled.
          </p>
        </div>
        <Link
          to="/incidents/admin"
          className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
        >
          Back to Admin Active
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading cancelled tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">
          No cancelled tickets available.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    #{t.id} - {t.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t.requesterEmail} • {t.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={t.status} />
                  <Link
                    to={`/incidents/admin/${t.id}`}
                    className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
