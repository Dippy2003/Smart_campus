import { Link } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";
import {
  Users,
  Calendar,
  AlertTriangle,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const { logout } = useAdminAuth();

  const adminSections = [
    {
      title: "Resource Management",
      description: "Manage campus resources, facilities, and equipment",
      icon: Settings,
      links: [
        { label: "View All Resources", to: "/admin/resources" },
        { label: "Add New Resource", to: "/admin/resources/new" },
      ],
      color: "blue",
    },
    {
      title: "Booking Management", 
      description: "Review and manage booking requests",
      icon: Calendar,
      links: [
        { label: "View All Bookings", to: "/bookings/admin" },
      ],
      color: "emerald",
    },
    {
      title: "Ticket Management",
      description: "Handle incident tickets and maintenance requests", 
      icon: AlertTriangle,
      links: [
        { label: "Active Tickets", to: "/incidents/admin" },
        { label: "Resolved Tickets", to: "/incidents/admin-resolved" },
      ],
      color: "amber",
    },
    {
      title: "Analytics",
      description: "View system statistics and reports",
      icon: BarChart3,
      links: [
        { label: "Resource Utilization", to: "/admin/analytics" },
      ],
      color: "purple",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      emerald: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700", 
      amber: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Manage campus operations and resources
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {adminSections.map((section, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getColorClasses(section.color)} text-white shadow-lg`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.to}
                    className={`block rounded-lg bg-gradient-to-r ${getColorClasses(section.color)} px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:shadow-md`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">24</p>
                <p className="text-xs text-slate-600">Total Resources</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">18</p>
                <p className="text-xs text-slate-600">Active Bookings</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">7</p>
                <p className="text-xs text-slate-600">Open Tickets</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">156</p>
                <p className="text-xs text-slate-600">Total Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
