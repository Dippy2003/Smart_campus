import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  triggerDemoNotification,
  formatTimeAgo,
  NOTIFICATION_META,
} from "../services/notificationService";

/**
 * NotificationList – full notification feed for the /notifications page.
 * Renders filter tabs (All / Unread), individual cards, and mark-read controls.
 */
export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all"); // "all" | "unread"
  const [demoLoading, setDemoLoading]     = useState(false);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkOne = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAll = async () => {
    const updated = await markAllAsRead();
    setNotifications(updated);
  };

  const handleDemo = async (type) => {
    setDemoLoading(true);
    try {
      await triggerDemoNotification(type);
      await load();
    } finally {
      setDemoLoading(false);
    }
  };

  const visible = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "unread" ? `Unread (${unreadCount})` : "All"}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Notification cards ── */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 text-sm font-medium text-slate-600">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((n) => {
            const meta = NOTIFICATION_META[n.type] || { icon: "🔔", cls: "text-slate-700 bg-slate-50 border-slate-200" };
            return (
              <li
                key={n.id}
                className={`flex gap-4 rounded-2xl border p-4 transition ${
                  n.read
                    ? "border-slate-200 bg-white"
                    : "border-emerald-200 bg-emerald-50/50 shadow-sm"
                }`}
              >
                {/* Icon */}
                <span className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-lg ${meta.cls}`}>
                  {meta.icon}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? "text-slate-700" : "text-slate-900"}`}>
                      {n.title}
                    </p>
                    <span className="flex-shrink-0 text-xs text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                </div>

                {/* Mark read */}
                {!n.read && (
                  <button
                    onClick={() => handleMarkOne(n.id)}
                    className="mt-1 flex-shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                  >
                    Mark read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Demo trigger (development only) ── */}
      {import.meta.env?.DEV !== false && (
        <details className="rounded-xl border border-dashed border-slate-300 p-4">
          <summary className="cursor-pointer text-xs font-semibold text-slate-500">
            🧪 Demo: trigger a notification
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {["BOOKING_APPROVED", "BOOKING_REJECTED", "TICKET_UPDATED", "COMMENT_ADDED"].map((type) => (
              <button
                key={type}
                onClick={() => handleDemo(type)}
                disabled={demoLoading}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
