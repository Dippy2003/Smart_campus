import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketListItem({ ticket, onOpen }) {
  const unreadCount = (ticket.notifications || []).filter((n) => !n.read).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left shadow-md shadow-slate-950/60 transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-blue-900/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-50">
            {ticket.title}
          </h3>
          <p className="mt-1 max-h-10 overflow-hidden text-xs text-slate-300">
            {ticket.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-200 border border-blue-500/20">
              {ticket.category}
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-200 border border-blue-500/30">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            #{ticket.id}
          </div>
          <div className="text-[11px] text-slate-500">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </button>
  );
}

