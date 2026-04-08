import { Routes, Route, Outlet } from "react-router-dom";

// Member 1 Imports
import ResourcesPage from "./features/member1-resources/pages/ResourcesPage";
import ResourceDetailsPage from "./features/member1-resources/pages/ResourceDetailsPage";
import AdminResourcesPage from "./features/member1-resources/pages/AdminResourcesPage";
import AddResourcePage from "./features/member1-resources/pages/AddResourcePage";
import EditResourcePage from "./features/member1-resources/pages/EditResourcePage";

// Shared Pages
import HomePage from "./shared/pages/HomePage";
import SmartCampusLandingPage from "./shared/pages/SmartCampusLandingPage";
import AdminDashboard from "./shared/pages/AdminDashboard";
import AdminAnalyticsPage from "./shared/pages/AdminAnalyticsPage";
import PlaceholderModulePage from "./shared/pages/PlaceholderModulePage";
import PillNavbar from "./shared/components/PillNavbar";

// Member 2 Imports
import CreateBookingPage from "./features/member2-bookings/pages/CreateBookingPage";
import MyBookingsPage from "./features/member2-bookings/pages/MyBookingsPage";
import AdminBookingsPage from "./features/member2-bookings/pages/AdminBookingsPage";
import BookingHomePage from "./features/member2-bookings/pages/BookingHomePage";

// Member 3 Imports
import IncidentsHomePage from "./features/member3-incidents/pages/IncidentsHomePage";
import CreateTicketPage from "./features/member3-incidents/pages/CreateTicketPage";
import IncidentsIndexPage from "./features/member3-incidents/pages/IncidentsIndexPage";
import MyTicketsPage from "./features/member3-incidents/pages/MyTicketsPage";
import AdminTicketsPage from "./features/member3-incidents/pages/AdminTicketsPage";
import AdminTicketDetailsPage from "./features/member3-incidents/pages/AdminTicketDetailsPage";
import MyResolvedTicketsPage from "./features/member3-incidents/pages/MyResolvedTicketsPage";
import AdminResolvedTicketsPage from "./features/member3-incidents/pages/AdminResolvedTicketsPage";
import MyCancelledTicketsPage from "./features/member3-incidents/pages/MyCancelledTicketsPage";
import AdminCancelledTicketsPage from "./features/member3-incidents/pages/AdminCancelledTicketsPage";
import TechnicianTicketsPage from "./features/member3-incidents/pages/TechnicianTicketsPage";
import { ToastProvider } from "./shared/components/ToastProvider";
import AppErrorBoundary from "./features/member4-auth/components/AppErrorBoundary";

// Member 4 Auth Imports (Module E)
import { AuthProvider } from "./features/member4-auth/Contexts/AuthContext";
import LoginPage from "./features/member4-auth/pages/LoginPage";
import NotificationsPage from "./features/member4-auth/pages/NotificationsPage";
import UnauthorizedPage from "./features/member4-auth/pages/UnauthorizedPage";
import RoleGuard from "./features/member4-auth/components/RoleGuard";
import AuthGuard from "./features/member4-auth/components/AuthGuard";

function MissingComponent({ name }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
      Missing component: <span className="font-semibold">{name}</span>
    </div>
  );
}

function SafeComponent({ component: Component, name }) {
  if (!Component) return <MissingComponent name={name} />;
  return <Component />;
}

/**
 * MainShell - Layout wrapper for standard pages
 */
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
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-950 text-slate-200">
          <SafeComponent component={PillNavbar} name="PillNavbar" />

          <AppErrorBoundary>
            <Routes>
            {/* 1. Public Routes */}
            <Route path="/" element={<SafeComponent component={SmartCampusLandingPage} name="SmartCampusLandingPage" />} />
            <Route path="/admin/login" element={<SafeComponent component={LoginPage} name="LoginPage" />} />
            <Route path="/login" element={<SafeComponent component={LoginPage} name="LoginPage" />} />
            <Route path="/unauthorized" element={<SafeComponent component={UnauthorizedPage} name="UnauthorizedPage" />} />
            <Route path="/resources" element={<SafeComponent component={ResourcesPage} name="ResourcesPage" />} />
            <Route path="/resources/:id" element={<SafeComponent component={ResourceDetailsPage} name="ResourceDetailsPage" />} />

            {/* 2. Admin & Technician Managed Routes (Full Bleed) */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard roles={["ADMIN", "TECHNICIAN"]}>
                  <SafeComponent component={AdminDashboard} name="AdminDashboard" />
                </RoleGuard>
              }
            />
            <Route path="/admin/analytics" element={<RoleGuard roles={["ADMIN"]}><SafeComponent component={AdminAnalyticsPage} name="AdminAnalyticsPage" /></RoleGuard>} />
            <Route path="/admin/resources" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminResourcesPage} name="AdminResourcesPage" /></RoleGuard>} />
            <Route path="/admin/resources/new" element={<RoleGuard roles={["ADMIN"]}><SafeComponent component={AddResourcePage} name="AddResourcePage" /></RoleGuard>} />
            <Route path="/admin/resources/:id/edit" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={EditResourcePage} name="EditResourcePage" /></RoleGuard>} />

            {/* 3. Protected Shell Routes */}
            <Route element={<MainShell />}>
              <Route path="/dashboard" element={<AuthGuard><SafeComponent component={HomePage} name="HomePage" /></AuthGuard>} />
              <Route path="/notifications" element={<AuthGuard><SafeComponent component={NotificationsPage} name="NotificationsPage" /></AuthGuard>} />

              {/* Member 2 - Bookings */}
              <Route path="/bookings" element={<SafeComponent component={BookingHomePage} name="BookingHomePage" />}>
                <Route index element={<SafeComponent component={CreateBookingPage} name="CreateBookingPage" />} />
                <Route path="create" element={<SafeComponent component={CreateBookingPage} name="CreateBookingPage" />} />
                <Route path="my" element={<AuthGuard><SafeComponent component={MyBookingsPage} name="MyBookingsPage" /></AuthGuard>} />
                <Route path="admin" element={<RoleGuard roles={["ADMIN"]}><SafeComponent component={AdminBookingsPage} name="AdminBookingsPage" /></RoleGuard>} />
              </Route>

              {/* Member 3 - Incidents */}
              <Route path="/incidents" element={<SafeComponent component={IncidentsHomePage} name="IncidentsHomePage" />}>
                <Route index element={<SafeComponent component={CreateTicketPage} name="CreateTicketPage" />} />
                <Route path="create" element={<SafeComponent component={CreateTicketPage} name="CreateTicketPage" />} />
                <Route path="my" element={<AuthGuard><SafeComponent component={MyTicketsPage} name="MyTicketsPage" /></AuthGuard>} />
                <Route path="my-resolved" element={<AuthGuard><SafeComponent component={MyResolvedTicketsPage} name="MyResolvedTicketsPage" /></AuthGuard>} />
                <Route path="my-cancelled" element={<AuthGuard><SafeComponent component={MyCancelledTicketsPage} name="MyCancelledTicketsPage" /></AuthGuard>} />
                <Route path="technician" element={<RoleGuard roles={["TECHNICIAN"]}><SafeComponent component={TechnicianTicketsPage} name="TechnicianTicketsPage" /></RoleGuard>} />
                <Route path="admin" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminTicketsPage} name="AdminTicketsPage" /></RoleGuard>} />
                <Route path="admin-resolved" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminResolvedTicketsPage} name="AdminResolvedTicketsPage" /></RoleGuard>} />
                <Route path="admin-cancelled" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminCancelledTicketsPage} name="AdminCancelledTicketsPage" /></RoleGuard>} />
                <Route path="admin/:id" element={<RoleGuard roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminTicketDetailsPage} name="AdminTicketDetailsPage" /></RoleGuard>} />
              </Route>

              {/* Module Placeholders */}
              <Route path="/member2" element={<SafeComponent component={PlaceholderModulePage} name="PlaceholderModulePage" />} />
              <Route path="/member3" element={<SafeComponent component={PlaceholderModulePage} name="PlaceholderModulePage" />} />
              <Route path="/member4" element={<AuthGuard><SafeComponent component={NotificationsPage} name="NotificationsPage" /></AuthGuard>} />
            </Route>
            </Routes>
          </AppErrorBoundary>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}