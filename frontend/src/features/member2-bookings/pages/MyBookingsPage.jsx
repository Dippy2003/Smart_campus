// frontend/src/features/member2-bookings/pages/MyBookingsPage.jsx

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

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 6, fontSize: "20px", fontWeight: 600 }}>
        My Bookings
      </h2>
      <p style={{ marginBottom: 20, color: "#6b7280", fontSize: "14px" }}>
        Enter your email to view all your booking requests.
      </p>

      <form
        onSubmit={fetchBookings}
        style={{ display: "flex", gap: 10, marginBottom: 24 }}
      >
        <input
          type="email"
          placeholder="Enter your email address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ color: "#991b1b", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 14px", marginBottom: 16, fontSize: "14px" }}>
          {error}
        </div>
      )}

      {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}

      {searched && !loading && bookings.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
          <p style={{ fontSize: "15px" }}>No bookings found for <strong>{email}</strong></p>
          <p style={{ fontSize: "13px" }}>Try creating a booking first.</p>
        </div>
      )}

      {bookings.map((b) => (
        <div
          key={b.id}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "15px" }}>
                {b.resource?.name || "Resource"} — {b.resource?.location}
              </p>
              <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: "13px" }}>
                {b.bookingDate} &nbsp;·&nbsp; {b.startTime} – {b.endTime}
              </p>
              <p style={{ margin: "0 0 6px", color: "#374151", fontSize: "13px" }}>
                {b.purpose}
                {b.attendees ? ` · ${b.attendees} attendees` : ""}
              </p>
              {b.adminReason && (
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
                  Admin note: {b.adminReason}
                </p>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 16 }}>
              <BookingStatusBadge status={b.status} />
              {(b.status === "PENDING" || b.status === "APPROVED") && (
                <button
                  onClick={() => handleCancel(b.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
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
