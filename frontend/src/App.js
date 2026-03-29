import { Routes, Route, Link } from "react-router-dom";

import ResourcesPage from "./features/member1-resources/pages/ResourcesPage";
import ResourceDetailsPage from "./features/member1-resources/pages/ResourceDetailsPage";
import AdminResourcesPage from "./features/member1-resources/pages/AdminResourcesPage";
import AddResourcePage from "./features/member1-resources/pages/AddResourcePage";
import EditResourcePage from "./features/member1-resources/pages/EditResourcePage";
import AdminLoginPage from "./features/member1-resources/pages/AdminLoginPage";
import AdminRoute from "./shared/auth/AdminRoute";
import { useAdminAuth } from "./shared/auth/AdminAuthContext";
import HomePage from "./shared/pages/HomePage";
import PlaceholderModulePage from "./shared/pages/PlaceholderModulePage";
import CreateBookingPage from "./features/member2-bookings/pages/CreateBookingPage";
import MyBookingsPage from "./features/member2-bookings/pages/MyBookingsPage";
import AdminBookingsPage from "./features/member2-bookings/pages/AdminBookingsPage";
import BookingHomePage from "./features/member2-bookings/pages/BookingHomePage";


export default function App() {
  const { isAdmin, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Resource Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse, administer, and keep track of all your resources.
            </p>
          </div>

          <nav className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
            <Link
              to="/"
              className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              to="/resources"
              className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Resources
            </Link>

            {isAdmin ? (
              <>
                <Link
                  to="/admin/resources"
                  className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Admin
                </Link>
                <Link
                  to="/admin/resources/new"
                  className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-500"
                >
                  Add resource
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Admin login
              </Link>
            )}
          </nav>
        </header>

        <main className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailsPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/admin/resources"
              element={
                <AdminRoute>
                  <AdminResourcesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/resources/new"
              element={
                <AdminRoute>
                  <AddResourcePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/resources/:id/edit"
              element={
                <AdminRoute>
                  <EditResourcePage />
                </AdminRoute>
              }
            />
            <Route path="/bookings" element={<BookingHomePage />}>
              <Route index element={<CreateBookingPage />} />
              <Route path="create" element={<CreateBookingPage />} />
              <Route path="my" element={<MyBookingsPage />} />
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminBookingsPage />
                  </AdminRoute>
                }
              />
            </Route>

            
            <Route path="/member2" element={<PlaceholderModulePage title="Member 2 Module" />} />
            <Route path="/member3" element={<PlaceholderModulePage title="Member 3 Module" />} />
            <Route path="/member4" element={<PlaceholderModulePage title="Member 4 Module" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
