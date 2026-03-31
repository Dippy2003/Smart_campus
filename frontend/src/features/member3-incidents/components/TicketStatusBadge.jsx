export default function TicketStatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();

  const styles =
    normalized === "OPEN"
      ? "bg-blue-500/10 text-blue-200 border border-blue-500/30"
      : normalized === "IN_PROGRESS"
        ? "bg-amber-500/10 text-amber-200 border border-amber-500/30"
        : normalized === "RESOLVED"
          ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
          : normalized === "CLOSED"
            ? "bg-slate-500/10 text-slate-200 border border-slate-500/30"
            : "bg-slate-700/20 text-slate-200 border border-slate-700/30";

  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide " +
        styles
      }
    >
      {normalized || "UNKNOWN"}
    </span>
  );
}

