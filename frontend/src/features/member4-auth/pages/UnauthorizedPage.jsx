import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

/**
 * UnauthorizedPage – /unauthorized
 * Shown by RoleGuard when a user's role doesn't match the required roles.
 */
export default function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl">🔒</div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-600">
            {user
              ? `Your account (${user.role}) doesn't have permission to view this page.`
              : "You don't have permission to view this page."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Go back
          </button>
          <Link
            to="/"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
