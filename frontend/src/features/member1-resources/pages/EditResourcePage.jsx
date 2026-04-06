import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResourceForm from "../components/ResourceForm";
import { getResourceById, updateResource } from "../services/resourceApi";

export default function EditResourcePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getResourceById(id);
        setInitialValues(res.data);
      } catch {
        setInitialValues({ _notFound: true });
      }
    })();
  }, [id]);

  const submit = async (data) => {
    setError("");
    try {
      await updateResource(id, data);
      nav("/admin/resources");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update resource. Check backend is running.");
    }
  };

  if (initialValues?._notFound) {
    return (
      <div className="space-y-4">
        <p className="text-red-300">Resource not found.</p>
        <Link to="/admin/resources" className="text-xs text-blue-400 hover:text-blue-300">
          ← Back to admin
        </Link>
      </div>
    );
  }

  if (!initialValues) {
    return <p className="text-xs text-slate-400">Loading resource…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Edit resource
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Update the fields below and save your changes.
          </p>
        </div>
        <Link
          to="/admin/resources"
          className="text-xs font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back to admin
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <ResourceForm initialValues={initialValues} onSubmit={submit} submitText="Save changes" />
    </div>
  );
}
