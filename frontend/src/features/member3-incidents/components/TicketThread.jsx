export default function TicketThread({ updates, notifications }) {
  const safeUpdates = Array.isArray(updates) ? updates : [];
  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-slate-50">Request & Replies</h3>
        <div className="mt-3 space-y-3">
          {safeUpdates.length === 0 && (
            <p className="text-xs text-slate-400">
              No updates yet.
            </p>
          )}
          {safeUpdates.map((u) => (
            <div key={u.id} className="rounded-xl bg-slate-900/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {u.authorType === "ADMIN" ? "Admin Reply" : "Requester"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(u.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-200 whitespace-pre-wrap">
                {u.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-slate-50">
          Notifications
        </h3>
        <div className="mt-3 space-y-3">
          {safeNotifications.length === 0 && (
            <p className="text-xs text-slate-400">
              No notifications yet.
            </p>
          )}
          {safeNotifications.map((n) => (
            <div
              key={n.id}
              className={
                "rounded-xl p-3 " +
                (n.read ? "bg-slate-900/30" : "bg-blue-500/10")
              }
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {n.read ? "Read" : "New"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-200 whitespace-pre-wrap">
                {n.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

