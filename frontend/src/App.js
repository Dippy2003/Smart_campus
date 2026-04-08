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

// Member 4 Auth Imports (Using exact paths from your project structure)
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

function isRenderableType(t) {
  if (!t) return false;
  const typ = typeof t;
  if (typ === "function") return true; // function/class components
  // React memo/forwardRef/lazy are objects with $$typeof
  if (typ === "object" && t.$$typeof) return true;
  return false;
}

function SafeComponent({ component: Component, name }) {
  if (!isRenderableType(Component)) return <MissingComponent name={name} />;
  return <Component />;
}

const AuthProviderSafe = isRenderableType(AuthProvider)
  ? AuthProvider
  : ({ children }) => children;
const ToastProviderSafe = isRenderableType(ToastProvider)
  ? ToastProvider
  : ({ children }) => children;
const AuthGuardSafe = isRenderableType(AuthGuard)
  ? AuthGuard
  : ({ children }) => children;
const RoleGuardSafe = isRenderableType(RoleGuard)
  ? RoleGuard
  : ({ children }) => children;

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
    <AppErrorBoundary>
      <AuthProviderSafe>
        <ToastProviderSafe>
          <div className="min-h-screen bg-slate-950 text-slate-200">
            <SafeComponent component={PillNavbar} name="PillNavbar" />

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
                  <RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}>
                    <SafeComponent component={AdminDashboard} name="AdminDashboard" />
                  </RoleGuardSafe>
                }
              />
              <Route path="/admin/analytics" element={<RoleGuardSafe roles={["ADMIN"]}><SafeComponent component={AdminAnalyticsPage} name="AdminAnalyticsPage" /></RoleGuardSafe>} />
              <Route path="/admin/resources" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminResourcesPage} name="AdminResourcesPage" /></RoleGuardSafe>} />
              <Route path="/admin/resources/new" element={<RoleGuardSafe roles={["ADMIN"]}><SafeComponent component={AddResourcePage} name="AddResourcePage" /></RoleGuardSafe>} />
              <Route path="/admin/resources/:id/edit" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={EditResourcePage} name="EditResourcePage" /></RoleGuardSafe>} />

              {/* 3. Protected Shell Routes */}
              <Route element={<MainShell />}>
                <Route path="/dashboard" element={<AuthGuardSafe><SafeComponent component={HomePage} name="HomePage" /></AuthGuardSafe>} />
                <Route path="/notifications" element={<AuthGuardSafe><SafeComponent component={NotificationsPage} name="NotificationsPage" /></AuthGuardSafe>} />

                {/* Member 2 - Bookings */}
                <Route path="/bookings" element={<SafeComponent component={BookingHomePage} name="BookingHomePage" />}>
                  <Route index element={<SafeComponent component={CreateBookingPage} name="CreateBookingPage" />} />
                  <Route path="create" element={<SafeComponent component={CreateBookingPage} name="CreateBookingPage" />} />
                  <Route path="my" element={<AuthGuardSafe><SafeComponent component={MyBookingsPage} name="MyBookingsPage" /></AuthGuardSafe>} />
                  <Route path="admin" element={<RoleGuardSafe roles={["ADMIN"]}><SafeComponent component={AdminBookingsPage} name="AdminBookingsPage" /></RoleGuardSafe>} />
                </Route>

                {/* Member 3 - Incidents */}
                <Route path="/incidents" element={<SafeComponent component={IncidentsHomePage} name="IncidentsHomePage" />}>
                  <Route index element={<SafeComponent component={CreateTicketPage} name="CreateTicketPage" />} />
                  <Route path="create" element={<SafeComponent component={CreateTicketPage} name="CreateTicketPage" />} />
                  <Route path="my" element={<AuthGuardSafe><SafeComponent component={MyTicketsPage} name="MyTicketsPage" /></AuthGuardSafe>} />
                  <Route path="my-resolved" element={<AuthGuardSafe><SafeComponent component={MyResolvedTicketsPage} name="MyResolvedTicketsPage" /></AuthGuardSafe>} />
                  <Route path="my-cancelled" element={<AuthGuardSafe><SafeComponent component={MyCancelledTicketsPage} name="MyCancelledTicketsPage" /></AuthGuardSafe>} />

                  <Route path="technician" element={<RoleGuardSafe roles={["TECHNICIAN"]}><SafeComponent component={TechnicianTicketsPage} name="TechnicianTicketsPage" /></RoleGuardSafe>} />

                  <Route path="admin" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminTicketsPage} name="AdminTicketsPage" /></RoleGuardSafe>} />
                  <Route path="admin-resolved" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminResolvedTicketsPage} name="AdminResolvedTicketsPage" /></RoleGuardSafe>} />
                  <Route path="admin-cancelled" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminCancelledTicketsPage} name="AdminCancelledTicketsPage" /></RoleGuardSafe>} />
                  <Route path="admin/:id" element={<RoleGuardSafe roles={["ADMIN", "TECHNICIAN"]}><SafeComponent component={AdminTicketDetailsPage} name="AdminTicketDetailsPage" /></RoleGuardSafe>} />
                </Route>

                {/* Module Placeholders */}
                <Route path="/member2" element={<SafeComponent component={PlaceholderModulePage} name="PlaceholderModulePage" />} />
                <Route path="/member3" element={<SafeComponent component={PlaceholderModulePage} name="PlaceholderModulePage" />} />
                <Route path="/member4" element={<AuthGuardSafe><SafeComponent component={NotificationsPage} name="NotificationsPage" /></AuthGuardSafe>} />
              </Route>
            </Routes>
          </div>
        </ToastProviderSafe>
      </AuthProviderSafe>
    </AppErrorBoundary>
  );
}