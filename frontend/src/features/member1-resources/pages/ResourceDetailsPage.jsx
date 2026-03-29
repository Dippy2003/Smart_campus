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
    return <p className="text-xs text-slate-600">Loading resource…</p>;
  }

  if (!resource) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Resource not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {resource.name}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Detailed information about this resource.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          ID: {resource.id}
        </span>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-900 shadow-sm sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</p>
            <p className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
              {resource.type}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Capacity</p>
            <p className="mt-1 text-slate-900">{resource.capacity}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1 text-slate-900">{resource.location}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Availability
            </p>
            <p className="mt-1 text-slate-900">
              {resource.availabilityStart} – {resource.availabilityEnd}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1">
              <span
                className={
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                  (resource.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-amber-50 text-amber-900 ring-1 ring-amber-200")
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
        className="inline-flex items-center text-xs font-medium text-emerald-700 hover:text-emerald-900"
      >
        ← Back to resources
      </Link>
    </div>
  );
}
