import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

/**
 * UnauthorizedPage – /unauthorized
 * Shown by RoleGuard when a user's role doesn't match the required roles.
 */
export default function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-8 text-center shadow-xl shadow-slate-950/40 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-3xl">
          🔒
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-white">Access Denied</h2>
          <p className="text-sm text-slate-300">
            {user
              ? `Your account (${user.role}) doesn't have permission to view this page.`
              : "You don't have permission to view this page."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-slate-700 active:scale-95"
          >
            ← Go back
          </button>
          <Link
            to="/"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-indigo-500 active:scale-95"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
