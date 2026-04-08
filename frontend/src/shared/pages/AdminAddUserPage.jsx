import { Link } from "react-router-dom";

export default function AdminAddUserPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
      <h1 className="text-2xl font-semibold text-white">Add New User</h1>
      <p className="mt-2 text-sm text-slate-300">
        User creation form can be added here. The dashboard button is now ready and linked.
      </p>
      <div className="mt-5">
        <Link
          to="/admin/users"
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Go to All Users
        </Link>
      </div>
    </div>
  );
}

