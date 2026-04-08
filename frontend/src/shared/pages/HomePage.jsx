import { Link } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { useAuth } from "../../features/member4-auth/Contexts/AuthContext";

function ModuleCard({ title, description, to, cta }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg shadow-slate-950/60 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-900/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-slate-50">
            {title}
          </h3>
          <p className="text-xs text-slate-300">
            {description}
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300 transition group-hover:border-blue-500/70 group-hover:bg-slate-900 group-hover:text-blue-300">
          {cta}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isAdmin } = useAdminAuth();
  const { user } = useAuth();

  const sessionUserName = (() => {
    if (user?.name) return user.name;
    try {
      const cached = window.sessionStorage.getItem("paf-auth-user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.name) return parsed.name;
      }
    } catch {
      // Ignore malformed session cache.
    }
    return "there";
  })();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/20 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Hello {sessionUserName}
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              What you can do from here: see resources, book resources, use incident
              ticketing, and check your notifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/resources"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              Find resources
            </Link>
            {isAdmin && (
              <Link
                to="/admin/resources"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                Go to admin
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            What you can do
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Jump into the four main sections below.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleCard
            title="See Resources"
            description="Browse and view campus resources."
            to="/resources"
            cta="Open"
          />
          <ModuleCard
            title="Book Resource"
            description="Create and manage your resource bookings."
            to="/bookings"
            cta="Open"
          />
          <ModuleCard
            title="Incident Ticketing"
            description="Report issues and track incident tickets."
            to="/incidents/create"
            cta="Open"
          />
          <ModuleCard
            title="Notifications"
            description="View your latest alerts and updates."
            to="/notifications"
            cta="Open"
          />
        </div>
      </section>
    </div>
  );
}
