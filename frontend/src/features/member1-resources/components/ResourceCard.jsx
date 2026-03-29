import { Link } from "react-router-dom";

export default function ResourceCard({ resource }) {
  return (
    <div className="flex w-full max-w-sm flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="space-y-2">

        <h3 className="text-base font-semibold tracking-tight text-slate-50">
          {resource.name}
          <h1 className="inline-flex items-center rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 ml-2">
            ID: {resource.id}
          </h1>
        </h3>


        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-semibold uppercase tracking-wide text-[11px] text-slate-700">
            {resource.type}
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">
            Capacity: {resource.capacity}
          </span>
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold " +
              (resource.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-900 ring-1 ring-amber-200")
            }
          >
            {resource.status}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-600">
          <span className="font-medium text-slate-800">Location:</span> {resource.location}
        </p>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-600">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Availability</p>
          <p className="font-medium text-slate-900">
            {resource.availabilityStart} – {resource.availabilityEnd}
          </p>
        </div>

        <Link
          to={`/resources/${resource.id}`}
          className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
