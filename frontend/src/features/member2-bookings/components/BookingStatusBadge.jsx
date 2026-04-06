// Member2 - Bathiya | Booking Management Module B
// BookingStatusBadge.jsx — displays booking status with colour coding

import React from "react";

const STATUS_CONFIG = {
  PENDING: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fcd34d",
    icon: "⏳",
  },
  APPROVED: {
    background: "#d1fae5",
    color: "#065f46",
    border: "1px solid #6ee7b7",
    icon: "✓",
  },
  REJECTED: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    icon: "✗",
  },
  CANCELLED: {
    background: "#e0e7ff",
    color: "#3730a3",
    border: "1px solid #c7d2fe",
    icon: "—",
  },
};

export default function BookingStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span
      style={{
        background: config.background,
        color: config.color,
        border: config.border,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "10px" }}>{config.icon}</span>
      {status}
    </span>
  );
}
