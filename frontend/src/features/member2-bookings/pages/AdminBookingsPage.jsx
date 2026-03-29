// frontend/src/features/member2-bookings/pages/AdminBookingsPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../services/bookingService";
import BookingStatusBadge from "../components/BookingStatusBadge";
import ApproveRejectModal from "../components/ApproveRejectModal";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
            Admin — Booking Requests
          </h2>
          {pendingCount > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#b45309" }}>
              {pendingCount} booking{pendingCount > 1 ? "s" : ""} waiting for review
            </p>
          )}
        </div>
        <button
          onClick={fetchBookings}
          style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "13px" }}
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: filter === s ? "#2563eb" : "#fff",
              color: filter === s ? "#fff" : "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
          No bookings found.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["ID", "Resource", "User", "Date", "Time", "Purpose", "Attendees", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 12px", color: "#6b7280" }}>#{b.id}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>{b.resource?.name}</td>
                  <td style={{ padding: "10px 12px" }}>{b.bookedByEmail}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{b.bookingDate}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{b.startTime} – {b.endTime}</td>
                  <td style={{ padding: "10px 12px" }}>{b.purpose}</td>
                  <td style={{ padding: "10px 12px" }}>{b.attendees || "—"}</td>
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
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
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
