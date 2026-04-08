import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminUserService } from "../services/adminUserService";

export default function AdminAddUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.role) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await adminUserService.createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      navigate("/admin/users");
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <h1 className="text-2xl font-semibold text-white">Add New User</h1>
      <p className="mt-2 text-sm text-slate-300">
        Create a new account and assign the correct role.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-300">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-300">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-300">Password *</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="At least 8 chars, 1 uppercase, 1 number"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-300">Role *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
          <Link
            to="/admin/users"
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>

      <div className="mt-4">
        <Link
          to="/admin/users"
          className="inline-flex rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          Back to All Users
        </Link>
      </div>
    </div>
  );
}

