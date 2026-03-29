// frontend/src/features/member2-bookings/components/ApproveRejectModal.jsx

import React, { useState, useEffect } from "react";

export default function ApproveRejectModal({ booking, onApprove, onReject, onClose }) {
  const [reason, setReason] = useState("");

  // Reset reason when a new booking is selected
  useEffect(() => {
    setReason("");
  }, [booking]);

  if (!booking) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700 }}>
          Review Booking #{booking.id}
        </h3>

        {/* Booking details */}
        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 14px", margin: "14px 0", fontSize: "13px" }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Resource:</strong> {booking.resource?.name} — {booking.resource?.location}
          </p>
          <p style={{ margin: "0 0 4px" }}>
            <strong>User:</strong> {booking.bookedByEmail}
          </p>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Date:</strong> {booking.bookingDate} &nbsp;·&nbsp; {booking.startTime} – {booking.endTime}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Purpose:</strong> {booking.purpose}
            {booking.attendees ? ` (${booking.attendees} attendees)` : ""}
          </p>
        </div>

        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: 6 }}>
          Reason (optional)
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add a reason for your decision..."
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            padding: "8px 12px",
            fontSize: "13px",
            resize: "vertical",
            boxSizing: "border-box",
            marginBottom: "20px",
          }}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onReject(booking.id, reason)}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#fef2f2", color: "#991b1b", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(booking.id, reason)}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
