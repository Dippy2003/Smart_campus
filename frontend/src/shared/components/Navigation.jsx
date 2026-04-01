import { Link } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";

export default function Navigation({ variant = "default", className = "" }) {
  const { isAdmin } = useAdminAuth();

  if (variant === "landing") {
    // Landing page navigation - dark theme, more compact
    return (
      <header className={`sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur ${className}`}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-blue-400">
                SMART CAMPUS
              </span>
              <span className="text-sm font-medium text-slate-100">
                Operations Hub
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6 text-sm font-medium text-slate-200">
              <Link
                to="/"
                className="transition-colors hover:text-blue-400"
              >
                Home
              </Link>
              <Link
                to="/resources"
                className="transition-colors hover:text-blue-400"
              >
                Resources
              </Link>
              <Link
                to="/bookings"
                className="transition-colors hover:text-blue-400"
              >
                Bookings
              </Link>
              <Link
                to="/incidents/create"
                className="transition-colors hover:text-blue-400"
              >
                Tickets
              </Link>
              <Link
                to="/events"
                className="transition-colors hover:text-blue-400"
              >
                Events
              </Link>
            </div>
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/30 transition hover:bg-blue-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065 1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996-.608 2.296-.07 2.572 1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/30 transition hover:bg-blue-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button would go here if needed */}
        </nav>
      </header>
    );
  }

  // Default navigation for all other pages - light theme
  return (
    <header className={`mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Resource Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse, administer, and keep track of all your resources.
        </p>
      </div>

      <nav className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
        <Link
          to="/"
          className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Home
        </Link>
        <Link
          to="/resources"
          className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Resources
        </Link>

        <Link
          to="/bookings"
          className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Bookings
        </Link>

        <Link
          to="/incidents/create"
          className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Incidents
        </Link>

        {isAdmin ? (
          <Link
            to="/admin/dashboard"
            className="rounded-full bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-600"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/admin/login"
            className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Admin Login
          </Link>
        )}
      </nav>
    </header>
  );
}
