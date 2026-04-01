import { Routes, Route, useLocation } from "react-router-dom";

import ResourcesPage from "./features/member1-resources/pages/ResourcesPage";
import ResourceDetailsPage from "./features/member1-resources/pages/ResourceDetailsPage";
import AdminResourcesPage from "./features/member1-resources/pages/AdminResourcesPage";
import AddResourcePage from "./features/member1-resources/pages/AddResourcePage";
import EditResourcePage from "./features/member1-resources/pages/EditResourcePage";
import AdminLoginPage from "./features/member1-resources/pages/AdminLoginPage";
import AdminRoute from "./shared/auth/AdminRoute";
import HomePage from "./shared/pages/HomePage";
import SmartCampusLandingPage from "./shared/pages/SmartCampusLandingPage";
import AdminDashboard from "./shared/pages/AdminDashboard";
import PlaceholderModulePage from "./shared/pages/PlaceholderModulePage";
import Navigation from "./shared/components/Navigation";
import CreateBookingPage from "./features/member2-bookings/pages/CreateBookingPage";
import MyBookingsPage from "./features/member2-bookings/pages/MyBookingsPage";
import AdminBookingsPage from "./features/member2-bookings/pages/AdminBookingsPage";
import BookingHomePage from "./features/member2-bookings/pages/BookingHomePage";
import IncidentsHomePage from "./features/member3-incidents/pages/IncidentsHomePage";
import CreateTicketPage from "./features/member3-incidents/pages/CreateTicketPage";
import MyTicketsPage from "./features/member3-incidents/pages/MyTicketsPage";
import AdminTicketsPage from "./features/member3-incidents/pages/AdminTicketsPage";
import AdminTicketDetailsPage from "./features/member3-incidents/pages/AdminTicketDetailsPage";
import MyResolvedTicketsPage from "./features/member3-incidents/pages/MyResolvedTicketsPage";
import AdminResolvedTicketsPage from "./features/member3-incidents/pages/AdminResolvedTicketsPage";


export default function App() {
  const location = useLocation();

  // Show the full-screen Smart Campus landing page on the root route
  if (location.pathname === "/") {
    return <SmartCampusLandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        <Navigation />

        <main className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailsPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

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

            <Route path="/incidents" element={<IncidentsHomePage />}>
              <Route index element={<CreateTicketPage />} />
              <Route path="create" element={<CreateTicketPage />} />
              <Route path="my" element={<MyTicketsPage />} />
              <Route path="my-resolved" element={<MyResolvedTicketsPage />} />
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminTicketsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin-resolved"
                element={
                  <AdminRoute>
                    <AdminResolvedTicketsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/:id"
                element={
                  <AdminRoute>
                    <AdminTicketDetailsPage />
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
