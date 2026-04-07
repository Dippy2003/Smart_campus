import { Routes, Route, Outlet } from "react-router-dom";

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
import AdminAnalyticsPage from "./shared/pages/AdminAnalyticsPage";
import PlaceholderModulePage from "./shared/pages/PlaceholderModulePage";
import PillNavbar from "./shared/components/PillNavbar";
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
import MyCancelledTicketsPage from "./features/member3-incidents/pages/MyCancelledTicketsPage";
import AdminCancelledTicketsPage from "./features/member3-incidents/pages/AdminCancelledTicketsPage";
import TechnicianTicketsPage from "./features/member3-incidents/pages/TechnicianTicketsPage";

function MainShell() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:pt-20 lg:pb-10">
      <main className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/60 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PillNavbar />
      <Routes>
        <Route path="/" element={<SmartCampusLandingPage />} />

        {/* ── Full-bleed routes (no MainShell wrapper) ── */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/resources" element={<AdminRoute><AdminResourcesPage /></AdminRoute>} />
        <Route path="/admin/resources/new" element={<AdminRoute><AddResourcePage /></AdminRoute>} />
        <Route path="/admin/resources/:id/edit" element={<AdminRoute><EditResourcePage /></AdminRoute>} />

        {/* ── Standard shell routes ── */}
        <Route element={<MainShell />}>
          <Route path="/dashboard" element={<HomePage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/bookings" element={<BookingHomePage />}>
            <Route index element={<CreateBookingPage />} />
            <Route path="create" element={<CreateBookingPage />} />
            <Route path="my" element={<MyBookingsPage />} />
            <Route path="admin" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
          </Route>

          <Route path="/incidents" element={<IncidentsHomePage />}>
            <Route index element={<CreateTicketPage />} />
            <Route path="create" element={<CreateTicketPage />} />
            <Route path="my" element={<MyTicketsPage />} />
            <Route path="my-resolved" element={<MyResolvedTicketsPage />} />
            <Route path="my-cancelled" element={<MyCancelledTicketsPage />} />
            <Route path="technician" element={<TechnicianTicketsPage />} />
            <Route path="admin" element={<AdminRoute><AdminTicketsPage /></AdminRoute>} />
            <Route path="admin-resolved" element={<AdminRoute><AdminResolvedTicketsPage /></AdminRoute>} />
            <Route path="admin-cancelled" element={<AdminRoute><AdminCancelledTicketsPage /></AdminRoute>} />
            <Route path="admin/:id" element={<AdminRoute><AdminTicketDetailsPage /></AdminRoute>} />
          </Route>

          <Route path="/member2" element={<PlaceholderModulePage title="Member 2 Module" />} />
          <Route path="/member3" element={<PlaceholderModulePage title="Member 3 Module" />} />
          <Route path="/member4" element={<PlaceholderModulePage title="Member 4 Module" />} />
        </Route>
      </Routes>
    </div>
  );
}