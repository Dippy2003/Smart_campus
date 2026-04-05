// Member2 - Bathiya | Booking Management Module B
// AdminBookingsPage.jsx — admin view to manage all booking requests

import React, { useEffect, useState, useCallback } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../services/bookingService";
import BookingStatusBadge from "../components/BookingStatusBadge";
import ApproveRejectModal from "../components/ApproveRejectModal";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBookings(filter === "ALL" ? "" : filter);
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (id, reason) => {
    await approveBooking(id, reason);
    setSelected(null);
    fetchBookings();
  };

  const handleReject = async (id, reason) => {
    await rejectBooking(id, reason);
    setSelected(null);
    fetchBookings();
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  // Search filter — by email or resource name
  const filteredBookings = bookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.bookedByEmail?.toLowerCase().includes(q) ||
      b.resource?.name?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#fff" }}>
            Admin — Booking Requests
          </h2>
          {pendingCount > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#fcd34d" }}>
              ⏳ {pendingCount} booking{pendingCount > 1 ? "s" : ""} waiting for review
            </p>
          )}
        </div>
        <button
          onClick={fetchBookings}
          style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #475569", background: "#1e293b", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}
        >
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by email, resource or purpose..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "14px",
          padding: "9px 14px",
          borderRadius: "8px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "#fff",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      />

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid #475569",
              background: filter === s ? "#2563eb" : "#1e293b",
              color: filter === s ? "#fff" : "#94a3b8",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#94a3b8" }}>Loading...</p>}

      {!loading && filteredBookings.length === 0 && (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>
          No bookings found.
        </p>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                {["ID", "Resource", "User", "Date", "Time", "Purpose", "Attendees", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid #334155", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap", color: "#94a3b8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>#{b.id}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 500, color: "#e2e8f0" }}>{b.resource?.name}</td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{b.bookedByEmail}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "#cbd5e1" }}>{b.bookingDate}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "#cbd5e1" }}>{b.startTime} – {b.endTime}</td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{b.purpose}</td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{b.attendees || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {b.status === "PENDING" && (
                      <button
                        onClick={() => setSelected(b)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "6px",
                          background: "#1d4ed8",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApproveRejectModal
        booking={selected}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
