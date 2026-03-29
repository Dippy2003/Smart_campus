// frontend/src/features/member2-bookings/components/BookingStatusBadge.jsx

import React from "react";

const statusStyles = {
  PENDING:   { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },  // Warm amber
  APPROVED:  { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },  // Fresh green
  REJECTED:  { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },  // Soft red
  CANCELLED: { background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" },  // Lavender blue
};

export default function BookingStatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.PENDING;
  return (
    <span
      style={{
        ...style,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
