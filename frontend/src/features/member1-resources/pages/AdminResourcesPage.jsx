import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResourceTable from "../components/ResourceTable";
import { deleteResource, getAllResources } from "../services/resourceApi";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllResources();
      setResources(res.data);
    } catch (e) {
      setError("Cannot reach the backend API. Make sure Spring Boot is running on port 8080.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    setError("");
    try {
      await deleteResource(id);
      await loadAll();
    } catch (e) {
      setError("Delete failed. Check that the backend is running and reachable.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Admin · Resources
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Manage, edit, and remove resources from the system.
          </p>
        </div>

        <Link
          to="/admin/resources/new"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          + Add resource
        </Link>
      </div>

      {loading && <p className="text-xs text-slate-600">Loading resources…</p>}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <ResourceTable resources={resources} showAdminActions={true} onDelete={onDelete} />
    </div>
  );
}
