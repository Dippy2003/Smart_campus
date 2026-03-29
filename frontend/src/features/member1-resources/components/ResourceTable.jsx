import { Link } from "react-router-dom";

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600";

export default function ResourceTable({ resources, showAdminActions, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
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

          <tbody className="divide-y divide-slate-200 bg-white">
            {resources.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.id}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-700">
                    {r.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.capacity}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.location}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800">
                    {r.availabilityStart} – {r.availabilityEnd}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold " +
                      (r.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                        : "bg-amber-50 text-amber-900 ring-1 ring-amber-200")
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    to={`/resources/${r.id}`}
                    className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    Details
                  </Link>
                </td>

                {showAdminActions && (
                  <>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        to={`/admin/resources/${r.id}/edit`}
                        className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDelete?.(r.id)}
                        className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-rose-500"
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
                  className="px-4 py-10 text-center text-sm text-slate-500"
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
