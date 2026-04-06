// Member2 - Bathiya | Booking Management Module B
// MyBookingsPage.jsx — view and manage user's own bookings

import React, { useState } from "react";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import BookingStatusBadge from "../components/BookingStatusBadge";

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchBookings = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSearched(false);
    try {
      const data = await getMyBookings(input);
      setBookings(data);
      setEmail(input);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id, email);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Sort bookings by date
  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.bookingDate) - new Date(a.bookingDate);
    }
    return new Date(a.bookingDate) - new Date(b.bookingDate);
  });

  // Count by status
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-2 text-xl font-semibold text-white">My Bookings</h2>
      <p className="mb-5 text-sm text-slate-400">
        Enter your email to view all your booking requests.
      </p>

      <form onSubmit={fetchBookings} className="mb-6 flex gap-2.5">
        <input
          type="email"
          placeholder="Enter your email address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3.5 py-2.5 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300 mb-4">
          {error}
        </div>
      )}

      {loading && <p className="text-slate-400">Loading...</p>}

      {searched && !loading && bookings.length === 0 && (
        <div className="py-10 text-center text-slate-400">
          <p className="text-base">No bookings found for <strong className="text-white">{email}</strong></p>
          <p className="text-sm mt-1">Try creating a booking first.</p>
        </div>
      )}

      {/* Stats + sort bar */}
      {bookings.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
            {bookings.length} total &nbsp;·&nbsp;
            {pendingCount > 0 && <span style={{ color: "#fcd34d" }}>{pendingCount} pending </span>}
            {approvedCount > 0 && <span style={{ color: "#6ee7b7" }}>{approvedCount} approved</span>}
          </p>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              fontSize: "12px",
              background: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      )}

      {sortedBookings.map((b) => (
        <div
          key={b.id}
          className="mb-3 rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg transition hover:shadow-xl hover:border-slate-600"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="mb-1 text-base font-semibold text-white">
                {b.resource?.name || "Resource"} — {b.resource?.location}
              </p>
              <p className="mb-1 text-sm text-slate-400">
                {b.bookingDate} &nbsp;·&nbsp; {b.startTime} – {b.endTime}
              </p>
              <p className="mb-1.5 text-sm text-slate-300">
                {b.purpose}
                {b.attendees ? ` · ${b.attendees} attendees` : ""}
              </p>
              {b.adminReason && (
                <p className="text-xs italic text-slate-400">
                  Admin note: {b.adminReason}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <BookingStatusBadge status={b.status} />
              {(b.status === "PENDING" || b.status === "APPROVED") && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="rounded-lg border border-red-600 bg-red-900/50 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-800/50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
