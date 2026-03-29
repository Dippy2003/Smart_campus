// frontend/src/features/member2-bookings/pages/BookingHomePage.jsx

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function BookingHomePage() {
  const location = useLocation();

  // TODO: Replace with useAdminAuth() once Member 4 finishes auth
  // For now set to true so admin tab is visible for testing
  const isAdmin = true;

  const isActive = (path) =>
    location.pathname === `/bookings${path}` ||
    (path === "/create" && location.pathname === "/bookings");

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: 700, color: "#111827" }}>
          Booking Management
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
          Book resources, view your requests, and manage approvals.
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        <Link
          to="/bookings/create"
          style={tabStyle(isActive("/create"))}
        >
          Create Booking
        </Link>
        <Link
          to="/bookings/my"
          style={tabStyle(isActive("/my"))}
        >
          My Bookings
        </Link>
        {isAdmin && (
          <Link
            to="/bookings/admin"
            style={tabStyle(isActive("/admin"))}
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  );
}

const tabStyle = (active) => ({
  padding: "8px 20px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 600,
  background: active ? "#2563eb" : "#f3f4f6",
  color: active ? "#fff" : "#374151",
  border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
  transition: "all 0.15s",
});
