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
    <div className="mx-auto max-w-4xl px-5 py-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Booking Management
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Book resources, view your requests, and manage approvals.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="mb-7 flex flex-wrap gap-2">
        <Link
          to="/bookings/create"
          className={tabClass(isActive("/create"))}
        >
          Create Booking
        </Link>
        <Link
          to="/bookings/my"
          className={tabClass(isActive("/my"))}
        >
          My Bookings
        </Link>
        {isAdmin && (
          <Link
            to="/bookings/admin"
            className={tabClass(isActive("/admin"))}
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

const tabClass = (active) =>
  `inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-blue-600 text-white shadow-lg border border-blue-600"
      : "border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
  }`;
