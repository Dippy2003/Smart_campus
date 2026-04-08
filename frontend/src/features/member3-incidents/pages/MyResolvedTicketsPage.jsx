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

      {!authLoading && !email && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please sign in to view your resolved tickets.
        </div>
      )}

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

