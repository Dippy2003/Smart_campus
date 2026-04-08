import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TicketListItem from "../components/TicketListItem";
import { getMyTickets } from "../services/ticketService";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

function isResolvedStatus(status) {
  return status === "RESOLVED" || status === "CLOSED" || status === "REJECTED";
}

export default function MyResolvedTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const email = user?.email ?? "";
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);

  const fetchResolved = async () => {
    if (!email) return;
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

  useEffect(() => {
    if (authLoading) return;
    if (!email) {
      setTickets([]);
      setSubmitted(false);
      return;
    }
    fetchResolved();
  }, [email, authLoading]);

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            My Resolved Tickets
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            View tickets that are resolved or closed.
          </p>
        </div>
        <Link
          to="/incidents/my"
          className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-[1px] hover:bg-slate-700 active:scale-95"
        >
          Back to My Active Tickets
        </Link>
      </div>

      {!authLoading && !email && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Please sign in to view your resolved tickets.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {submitted && !loading && tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-800/60 p-6 text-sm text-slate-300">
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

