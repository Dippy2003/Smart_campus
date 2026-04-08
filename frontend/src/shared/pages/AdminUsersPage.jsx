import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminUserService } from "../services/adminUserService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "USER" });
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadUsers();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        const role = String(u.role || "USER").toUpperCase();
        if (role === "ADMIN") acc.admin += 1;
        else if (role === "TECHNICIAN") acc.technician += 1;
        else acc.user += 1;
        return acc;
      },
      { admin: 0, technician: 0, user: 0 }
    );
  }, [users]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: (user.role || "USER").toUpperCase(),
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", role: "USER" });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await adminUserService.updateUser(id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });
      await loadUsers();
      cancelEdit();
    } catch (e) {
      setError(e.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const ok = window.confirm(`Delete user "${user.name}" (${user.email})?`);
    if (!ok) return;
    setActionLoading(true);
    setError("");
    try {
      await adminUserService.deleteUser(user.id);
      await loadUsers();
    } catch (e) {
      setError(e.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">All Users</h1>
          <p className="mt-1 text-sm text-slate-400">Users loaded directly from the database.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/users/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Add New User
          </Link>
          <Link
            to="/admin/dashboard"
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total users</p>
          <p className="mt-1 text-2xl font-semibold text-white">{loading ? "..." : users.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Admins</p>
          <p className="mt-1 text-2xl font-semibold text-purple-300">{loading ? "..." : roleCounts.admin}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Technicians</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{loading ? "..." : roleCounts.technician}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-sm text-slate-300">{u.id}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      {editingId === u.id ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {editingId === u.id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === u.id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                          className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="TECHNICIAN">TECHNICIAN</option>
                        </select>
                      ) : (
                        <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200">
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === u.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(u.id)}
                            disabled={actionLoading}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            {actionLoading ? "Saving..." : "Update"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={actionLoading}
                            className="rounded bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-600 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            disabled={actionLoading}
                            className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            disabled={actionLoading}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

