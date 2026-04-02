import { Link } from "react-router-dom";

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400";

export default function ResourceTable({ resources, showAdminActions, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Capacity</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Availability</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>View</th>
              {showAdminActions && (
                <>
                  <th className={thClass}>Edit</th>
                  <th className={thClass}>Delete</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700 bg-slate-800">
            {resources.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-slate-700">
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">{r.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-white">{r.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold">
                  <span className="inline-flex rounded-full border border-slate-600 bg-slate-700 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                    {r.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">{r.capacity}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">{r.location}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                  <span className="rounded-full border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-slate-300">
                    {r.availabilityStart} – {r.availabilityEnd}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold " +
                      (r.status === "ACTIVE"
                        ? "bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700"
                        : "bg-amber-900/50 text-amber-300 ring-1 ring-amber-700")
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    to={`/resources/${r.id}`}
                    className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                  >
                    Details
                  </Link>
                </td>

                {showAdminActions && (
                  <>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        to={`/admin/resources/${r.id}/edit`}
                        className="inline-flex items-center rounded-full border border-slate-600 bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDelete?.(r.id)}
                        className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {resources.length === 0 && (
              <tr>
                <td
                  colSpan={showAdminActions ? 10 : 8}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No resources found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
