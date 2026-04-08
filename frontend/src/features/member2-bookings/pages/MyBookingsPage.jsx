// Member2 - Bathiya | Booking Management Module B
// MyBookingsPage.jsx — view, edit and manage user's own bookings

import React, { useState } from "react";
import { getMyBookings, cancelBooking, updateBooking } from "../services/bookingService";
import BookingStatusBadge from "../components/BookingStatusBadge";
import { useToast } from "../../../shared/components/ToastProvider";

export default function MyBookingsPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

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
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err.message || "Cancel failed.");
    }
  };

  const handleEditOpen = (booking) => {
    setEditingBooking(booking);
    setEditError(null);
    setEditForm({
      purpose: booking.purpose || "",
      attendees: booking.attendees || "",
      bookingDate: booking.bookingDate || "",
      startTime: booking.startTime || "",
      endTime: booking.endTime || "",
    });
  };

  const handleEditClose = () => {
    setEditingBooking(null);
    setEditForm({});
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (editForm.startTime >= editForm.endTime) {
      setEditError("End time must be after start time.");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await updateBooking(editingBooking.id, {
        purpose: editForm.purpose,
        attendees: String(editForm.attendees),
        bookingDate: editForm.bookingDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      handleEditClose();
      toast.success("Booking updated.");
    } catch (err) {
      setEditError(err.message);
      toast.error(err.message || "Update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.bookingDate) - new Date(a.bookingDate);
    }
    return new Date(a.bookingDate) - new Date(b.bookingDate);
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-2xl">

      {/* ── HEADER CHANGED TO "Booking Resources" ── */}
      <h2 className="mb-2 text-xl font-semibold text-white">Booking Resources</h2>
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
            style={{ fontSize: "12px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "6px", padding: "4px 8px" }}
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
              {b.status === "PENDING" && (
                <button
                  onClick={() => handleEditOpen(b)}
                  className="rounded-lg border border-blue-600 bg-blue-900/50 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-800/50"
                  style={{ width: "70px", textAlign: "center" }}
                >
                  Edit
                </button>
              )}
              {(b.status === "PENDING" || b.status === "APPROVED") && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="rounded-lg border border-red-600 bg-red-900/50 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-800/50"
                  style={{ width: "70px", textAlign: "center" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editingBooking && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={handleEditClose}
        >
          <div
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              Edit Booking #{editingBooking.id}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#94a3b8" }}>
              Only PENDING bookings can be edited.
            </p>

            {editError && (
              <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#fca5a5" }}>
                {editError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Purpose</label>
                <input type="text" value={editForm.purpose} onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Attendees</label>
                <input type="number" min="1" value={editForm.attendees} onChange={(e) => setEditForm({ ...editForm, attendees: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Booking Date</label>
                <input type="date" value={editForm.bookingDate} min={today} onChange={(e) => setEditForm({ ...editForm, bookingDate: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Time Range</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <span style={{ color: "#64748b", fontSize: "13px" }}>to</span>
                  <input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={handleEditClose} style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading} style={{ padding: "9px 24px", borderRadius: "8px", border: "none", background: editLoading ? "#1d4ed8" : "#2563eb", color: "#fff", fontWeight: 600, cursor: editLoading ? "not-allowed" : "pointer", fontSize: "13px", opacity: editLoading ? 0.7 : 1 }}>
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", fontSize: "13px", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "5px" };
