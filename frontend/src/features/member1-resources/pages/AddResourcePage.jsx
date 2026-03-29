import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ResourceForm from "../components/ResourceForm";
import { createResource } from "../services/resourceApi";

export default function AddResourcePage() {
  const nav = useNavigate();
  const [error, setError] = useState("");

  const submit = async (data) => {
    setError("");
    try {
      await createResource(data);
      nav("/admin/resources");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create resource. Check backend is running.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Add resource
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Fill in the details below to create a new resource.
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

      <ResourceForm onSubmit={submit} submitText="Create resource" />
    </div>
  );
}
