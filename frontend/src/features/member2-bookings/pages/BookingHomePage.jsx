// Member2 - Bathiya | Booking Management Module B
// BookingHomePage.jsx — main layout with tab navigation for booking module

import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { getBookingStats } from "../services/bookingService";

export default function BookingHomePage() {
  const location = useLocation();
  const [stats, setStats] = useState(null);

  // TODO: Replace with useAdminAuth() once Member 4 finishes auth
  const isAdmin = true;

  // Load booking stats for the header
  useEffect(() => {
    getBookingStats()
      .then(setStats)
      .catch(() => {}); // silently fail if backend not ready
  }, []);

  const isActive = (path) =>
    location.pathname === `/bookings${path}` ||
    (path === "/create" && location.pathname === "/bookings");

  return (
    <div className="mx-auto max-w-4xl px-5 py-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Booking Management
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Book resources, view your requests, and manage approvals.
        </p>

        {/* Stats bar — shows pending count */}
        {stats && stats.pending > 0 && (
          <div style={{
            marginTop: "10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fcd34d",
            borderRadius: "999px",
            padding: "3px 12px",
            fontSize: "12px",
            fontWeight: 600,
          }}>
            ⏳ {stats.pending} booking{stats.pending > 1 ? "s" : ""} pending approval
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mb-7 flex flex-wrap gap-2">
        <Link to="/bookings/create" className={tabClass(isActive("/create"))}>
          Create Booking
        </Link>
        <Link to="/bookings/my" className={tabClass(isActive("/my"))}>
          My Bookings
        </Link>
        {isAdmin && (
          <Link to="/bookings/admin" className={tabClass(isActive("/admin"))}>
            Admin Panel
            {stats && stats.pending > 0 && (
              <span style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "999px",
                padding: "1px 6px",
                fontSize: "10px",
                marginLeft: "6px",
              }}>
                {stats.pending}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Page content renders here */}
      <Outlet />
    </div>
  );
}

const tabClass = (active) =>
  `inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-blue-600 text-white shadow-lg border border-blue-600"
      : "border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
  }`;
