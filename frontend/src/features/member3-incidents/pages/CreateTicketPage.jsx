import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../services/ticketService";

const CATEGORIES = ["MAINTENANCE", "SAFETY", "EQUIPMENT", "OTHER"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH"];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    requesterEmail: "",
    title: "",
    description: "",
    category: "MAINTENANCE",
    location: "",
    priority: "NORMAL",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);

  const canSubmit = useMemo(() => {
    return (
      form.requesterEmail.trim() &&
      form.title.trim() &&
      form.description.trim() &&
      form.location.trim()
    );
  }, [form]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessId(null);

    if (!canSubmit) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const created = await createTicket({
          requesterEmail: form.requesterEmail,
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
          priority: form.priority,
        });
        setSuccessId(created.id);
        setForm({
          requesterEmail: "",
          title: "",
          description: "",
          category: "MAINTENANCE",
          location: "",
          priority: "NORMAL",
        });
      } catch {
        setError("Could not create the ticket. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg">
      <h2 className="text-xl font-semibold tracking-tight text-white">
        Create an Incident Ticket
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Submit an issue with clear details so the maintenance team can respond
        quickly. Use your email to track updates in "My Tickets".
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Your Email *
            <input
              name="requesterEmail"
              type="email"
              value={form.requesterEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            />
          </label>

          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Location *
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Block C, Level 2 – Lecture Hall A"
              required
              className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            />
          </label>
        </div>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Title *
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Projector not turning on"
            required
            className="h-10 rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
          />
        </label>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Description *
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Include what happened, when it started, and any troubleshooting steps already tried."
            required
            rows={5}
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {successId && (
          <div className="rounded-2xl border border-green-700 bg-green-900/20 px-4 py-3 text-sm text-green-300">
            Ticket created successfully. Ticket ID:{" "}
            <span className="font-semibold">#{successId}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/incidents/my")}
            className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-600"
          >
            View My Tickets
          </button>
        </div>
      </form>
    </div>
  );
}

