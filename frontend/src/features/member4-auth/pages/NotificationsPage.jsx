import NotificationList from "../components/NotificationList";
import AuthGuard from "../components/AuthGuard";

/**
 * NotificationsPage – /notifications
 * Protected: any authenticated user can access.
 */
export default function NotificationsPage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Page header */}
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Notifications</h2>
              <p className="text-sm text-slate-300">Stay up to date on bookings, tickets, and comments.</p>
            </div>
          </div>
        </section>

        {/* Notification types legend */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "✅", label: "Booking approved", cls: "text-emerald-200 bg-emerald-500/15 border-emerald-400/30" },
            { icon: "❌", label: "Booking rejected", cls: "text-rose-200 bg-rose-500/15 border-rose-400/30" },
            { icon: "🔧", label: "Ticket status changed", cls: "text-amber-200 bg-amber-500/15 border-amber-400/30" },
            { icon: "💬", label: "New comment", cls: "text-sky-200 bg-sky-500/15 border-sky-400/30" },
          ].map((item) => (
            <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${item.cls}`}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>

        {/* Notification list */}
        <NotificationList />
      </div>
    </AuthGuard>
  );
}
