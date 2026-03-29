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
        <p className="text-rose-800">Resource not found.</p>
        <Link to="/admin/resources" className="text-xs text-emerald-700 hover:text-emerald-900">
          ← Back to admin
        </Link>
      </div>
    );
  }

  if (!initialValues) {
    return <p className="text-xs text-slate-600">Loading resource…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Edit resource
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Update the fields below and save your changes.
          </p>
        </div>
        <Link
          to="/admin/resources"
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
        >
          ← Back to admin
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <ResourceForm initialValues={initialValues} onSubmit={submit} submitText="Save changes" />
    </div>
  );
}
