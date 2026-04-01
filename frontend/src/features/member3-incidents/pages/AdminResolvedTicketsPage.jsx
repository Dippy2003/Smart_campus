import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { getAllTickets } from "../services/ticketService";

function isResolvedStatus(status) {
  return status === "RESOLVED" || status === "CLOSED";
}

export default function AdminResolvedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await getAllTickets();
      setTickets(all.filter((t) => isResolvedStatus(t.status)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Admin: Resolved Tickets
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tickets moved out of active workflow after resolution.
          </p>
        </div>
        <Link
          to="/incidents/admin"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Admin Active
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-600">Loading resolved tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          No resolved tickets available.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    #{t.id} - {t.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
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

