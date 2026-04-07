import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  formatTimeAgo,
  NOTIFICATION_META,
} from "../services/notificationService";

/**
 * NotificationBell – compact bell icon with unread badge + dropdown preview.
 * Place this in your Navbar/Header component.
 *
 * Props:
 *   pollInterval – ms between background re-fetches (default: 30 000)
 */
export default function NotificationBell({ pollInterval = 30000 }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const ref                               = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  /* ── Fetch ──────────────────────────────────────────────────── */
  const load = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  /* ── Close on outside click ─────────────────────────────────── */
  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Handlers ───────────────────────────────────────────────── */
  const handleMarkOne = async (id) => {
    const updated = await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const updated = await markAllAsRead();
      setNotifications(updated);
    } finally {
      setLoading(false);
    }
  };

  const preview = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={loading}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
              >
                {loading ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 divide-y divide-slate-50 overflow-y-auto">
            {preview.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</li>
            ) : (
              preview.map((n) => {
                const meta = NOTIFICATION_META[n.type] || { icon: "🔔", cls: "text-slate-700 bg-slate-50 border-slate-200" };
                return (
                  <li
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${!n.read ? "bg-emerald-50/40" : ""}`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-base ${meta.cls}`}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${n.read ? "text-slate-600" : "text-slate-900"}`}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkOne(n.id)}
                        className="mt-1 flex-shrink-0 text-[10px] font-medium text-emerald-600 hover:text-emerald-800"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
