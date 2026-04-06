// Member2 - Bathiya | Booking Management Module B
// ApproveRejectModal.jsx — admin modal to approve or reject bookings

import React, { useState, useEffect } from "react";

export default function ApproveRejectModal({ booking, onApprove, onReject, onClose }) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  // Reset state when booking changes
  useEffect(() => {
    setReason("");
    setReasonError("");
  }, [booking]);

  if (!booking) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      setReasonError("Please provide a reason for rejection.");
      return;
    }
    setReasonError("");
    onReject(booking.id, reason);
  };

  const handleApprove = () => {
    setReasonError("");
    onApprove(booking.id, reason);
  };

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

        {/* Booking summary */}
        <div style={{
          background: "#f9fafb",
          borderRadius: "8px",
          padding: "12px 14px",
          margin: "14px 0",
          fontSize: "13px",
          lineHeight: "1.7",
        }}>
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

        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: 4 }}>
          Reason
          <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
          <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: 4 }}>(required for rejection)</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
          placeholder="Add a reason for your decision..."
          style={{
            width: "100%",
            borderRadius: "8px",
            border: reasonError ? "1px solid #ef4444" : "1px solid #d1d5db",
            padding: "8px 12px",
            fontSize: "13px",
            resize: "vertical",
            boxSizing: "border-box",
            marginBottom: reasonError ? "4px" : "20px",
          }}
        />
        {reasonError && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px", marginTop: 0 }}>
            {reasonError}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#fef2f2", color: "#991b1b", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
