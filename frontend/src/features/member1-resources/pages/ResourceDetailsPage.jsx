import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResourceById } from "../services/resourceApi";

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getResourceById(id);
        setResource(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <p className="text-xs text-slate-400">Loading resource…</p>;
  }

  if (!resource) {
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
        Resource not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            {resource.name}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Detailed information about this resource.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-700 px-3 py-1 text-xs font-medium text-slate-200">
          ID: {resource.id}
        </span>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-200 shadow-lg sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Type</p>
            <p className="mt-1 inline-flex rounded-full border border-slate-600 bg-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              {resource.type}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Capacity</p>
            <p className="mt-1 text-slate-200">{resource.capacity}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
            <p className="mt-1 text-slate-200">{resource.location}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Availability
            </p>
            <p className="mt-1 text-slate-200">
              {resource.availabilityStart} – {resource.availabilityEnd}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1">
              <span
                className={
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                  (resource.status === "ACTIVE"
                    ? "bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700"
                    : "bg-amber-900/50 text-amber-300 ring-1 ring-amber-700")
                }
              >
                {resource.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <Link
        to="/resources"
        className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300"
      >
        ← Back to resources
      </Link>
    </div>
  );
}
