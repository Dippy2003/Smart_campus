import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

function tabStyle(active) {
  return (
          "rounded-full px-4 py-2 text-sm font-semibold transition " +
    (active
      ? "bg-blue-600 text-white shadow-sm"
      : "border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700")
  );
}

export default function IncidentsHomePage() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) =>
    location.pathname === `/incidents${path}` ||
    (path === "" && location.pathname === "/incidents");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Incident Ticketing
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Report issues across campus, track maintenance progress, and
          receive updates in one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link to="/incidents/create" className={tabStyle(isActive("/create"))}>
          Create Ticket
        </Link>
        <Link to="/incidents/my" className={tabStyle(isActive("/my"))}>
          My Tickets
        </Link>
        <Link to="/incidents/my-resolved" className={tabStyle(isActive("/my-resolved"))}>
          My Resolved
        </Link>
        {isAdmin && (
          <>
            <Link to="/incidents/admin" className={tabStyle(isActive("/admin"))}>
              Admin Panel
            </Link>
            <Link to="/incidents/admin-resolved" className={tabStyle(isActive("/admin-resolved"))}>
              Admin Resolved
            </Link>
          </>
        )}
      </div>

      <Outlet />
    </div>
  );
}

