// Member2 - Bathiya | Booking Management Module B
// BookingHomePage.jsx — main layout with tab navigation for booking module

import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function BookingHomePage() {
  const location = useLocation();
  const isAdminBookingsRoute = location.pathname.startsWith("/bookings/admin");

  const isActive = (path) =>
    location.pathname === `/bookings${path}` ||
    (path === "/create" && location.pathname === "/bookings");

  return (
    <div>
      <style>{`
        @keyframes bookingTabPop {
          0% { transform: scale(0.96); }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
      {/* Show member tabs only on non-admin booking routes */}
      {!isAdminBookingsRoute && (
        <div className="mx-auto mb-4 flex max-w-[980px] justify-center px-6 pt-1">
          <div className="inline-flex w-full max-w-max items-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-1.5 shadow-lg shadow-slate-950/40 backdrop-blur">
            <Link to="/bookings/create" className={tabClass(isActive("/create"))}>
              Create Booking
            </Link>
            <Link to="/bookings/my" className={tabClass(isActive("/my"))}>
              My Bookings
            </Link>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}

const tabClass = (active) =>
  `inline-flex min-w-[132px] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
    active
      ? "animate-[bookingTabPop_220ms_ease-out] border border-indigo-400/80 bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
      : "border border-transparent bg-transparent text-slate-300 hover:-translate-y-[1px] hover:border-slate-600/70 hover:bg-slate-800/80 hover:text-slate-100"
  }`;