import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/member4-auth/Contexts/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin/resources";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(username, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || "Login failed.");
      return;
    }

    nav(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
          Resource admin login
        </h2>
        <p className="text-xs text-slate-400">
          Only resource administrators can access the admin area.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-lg shadow-slate-950/60"
      >
        {error && (
          <div className="rounded-xl border border-red-700 bg-red-900/20 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="h-10 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            placeholder="admin"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-10 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
            placeholder="admin123"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          Demo credentials: <span className="font-mono text-slate-300">admin / admin123</span>.
        </p>
      </form>
    </div>
  );
}
