import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  AlertTriangle,
  Settings,
  BarChart3,
} from "lucide-react";
import { dashboardService } from "../services/dashboardService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalResources: 0,
    totalBookings: 0,
    totalTickets: 0,
    totalUsers: 156
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              Manage campus operations and resources
            </p>
          </div>
        </div>

        {/* Quick Stats - Moved to top */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/50 group-hover:bg-blue-800/70 transition-colors">
                <Settings className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                  {loading ? "..." : stats.totalResources}
                </p>
                <p className="text-xs text-slate-400 group-hover:text-blue-200 transition-colors">Total Resources</p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900/50 group-hover:bg-emerald-800/70 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                  {loading ? "..." : stats.totalBookings}
                </p>
                <p className="text-xs text-slate-400 group-hover:text-emerald-200 transition-colors">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900/50 group-hover:bg-amber-800/70 transition-colors">
                <AlertTriangle className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-amber-100 transition-colors">
                  {loading ? "..." : stats.totalTickets}
                </p>
                <p className="text-xs text-slate-400 group-hover:text-amber-200 transition-colors">Total Tickets</p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900/50 group-hover:bg-purple-800/70 transition-colors">
                <Users className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">
                  {loading ? "..." : stats.totalUsers}
                </p>
                <p className="text-xs text-slate-400 group-hover:text-purple-200 transition-colors">Total Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {adminSections.map((section, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getColorClasses(section.color)} text-white shadow-lg`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.to}
                    className={`block rounded-lg bg-gradient-to-r ${getColorClasses(section.color)} px-4 py-3 text-center text-sm font-medium text-white shadow-lg transition-all hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        </div>
    </div>
  );
}
