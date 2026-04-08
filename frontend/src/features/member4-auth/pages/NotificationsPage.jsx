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
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/80 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-600">Stay up to date on bookings, tickets, and comments.</p>
            </div>
          </div>
        </section>

        {/* Notification types legend */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "✅", label: "Booking approved",     cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { icon: "❌", label: "Booking rejected",     cls: "text-red-700 bg-red-50 border-red-200" },
            { icon: "🔧", label: "Ticket status changed",cls: "text-amber-700 bg-amber-50 border-amber-200" },
            { icon: "💬", label: "New comment",          cls: "text-blue-700 bg-blue-50 border-blue-200" },
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
