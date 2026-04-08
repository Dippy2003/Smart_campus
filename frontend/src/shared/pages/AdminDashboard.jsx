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
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: Users,
      links: [
        { label: "View All Users", to: "/admin/users" },
        { label: "Add New User", to: "/admin/users/new" },
      ],
      color: "purple",
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .ad-root {
          font-family: 'DM Sans', sans-serif;
          background: #080c1a;
          min-height: 100vh;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow-x: hidden;
        }

        .ad-root::before {
          content: '';
          position: fixed;
          top: -40%;
          left: -20%;
          width: 80vw;
          height: 80vh;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .ad-root::after {
          content: '';
          position: fixed;
          bottom: -30%;
          right: -10%;
          width: 60vw;
          height: 60vh;
          background: radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .ad-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          animation: ad-fade-in 0.5s ease both;
        }

        @keyframes ad-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ad-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .ad-header-left { display: flex; flex-direction: column; gap: 0.3rem; }
        .ad-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ad-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 2px;
          background: #6366f1;
          border-radius: 999px;
        }
        .ad-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .ad-title span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ad-subtitle {
          margin: 0.35rem 0 0;
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }

        .ad-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: #cbd5e1;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: transform 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .ad-home:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(255,255,255,0.06);
          transform: translateY(-1px);
          color: #fff;
        }

        .ad-stats {
          margin-bottom: 1.75rem;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 1024px) { .ad-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 520px) { .ad-stats { grid-template-columns: 1fr; } }

        .ad-stat {
          position: relative;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.05rem 1.15rem;
          overflow: hidden;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, transform 0.25s;
        }
        .ad-stat:hover { border-color: rgba(99,102,241,0.28); transform: translateY(-2px); }

        .ad-stat-row { display: flex; align-items: center; gap: 0.85rem; }
        .ad-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
        }
        .ad-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.55rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .ad-stat-label {
          margin-top: 0.2rem;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .ad-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 900px) { .ad-grid { grid-template-columns: 1fr; } }

        .ad-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 1.2rem 1.2rem;
          backdrop-filter: blur(12px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          transition: transform 0.2s, border-color 0.2s;
        }
        .ad-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.22); }
        .ad-card-top { display: flex; gap: 0.9rem; align-items: flex-start; }

        .ad-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.25);
          flex-shrink: 0;
        }

        .ad-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0;
          color: #fff;
        }
        .ad-card-desc {
          margin: 0.4rem 0 0;
          font-size: 13.5px;
          color: #94a3b8;
          font-weight: 300;
          line-height: 1.55;
        }

        .ad-links {
          margin-top: 1rem;
          display: grid;
          gap: 0.6rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 520px) { .ad-links { grid-template-columns: 1fr; } }

        .ad-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          border-radius: 14px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
        }
        .ad-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.34);
          filter: brightness(1.05);
        }
      `}</style>

      <div className="ad-root">
        <div className="ad-inner">
          <div className="ad-header">
            <div className="ad-header-left">
              <div className="ad-eyebrow">Admin</div>
              <h1 className="ad-title">
                Admin <span>dashboard</span>
              </h1>
              <p className="ad-subtitle">Manage campus operations and resources.</p>
            </div>
            <Link to="/" className="ad-home">← Back to home</Link>
          </div>

        {/* Quick Stats - Moved to top */}
          <div className="ad-stats">
            <div className="ad-stat">
              <div className="ad-stat-row">
                <div className="ad-stat-icon" style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.25), 0 12px 30px rgba(99,102,241,0.12) inset" }}>
                  <Settings className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <div className="ad-stat-value">{loading ? "…" : stats.totalResources}</div>
                  <div className="ad-stat-label">Total resources</div>
                </div>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat-row">
                <div className="ad-stat-icon" style={{ boxShadow: "0 0 0 1px rgba(16,185,129,0.22), 0 12px 30px rgba(16,185,129,0.10) inset" }}>
                  <Calendar className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="ad-stat-value">{loading ? "…" : stats.totalBookings}</div>
                  <div className="ad-stat-label">Total bookings</div>
                </div>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat-row">
                <div className="ad-stat-icon" style={{ boxShadow: "0 0 0 1px rgba(245,158,11,0.22), 0 12px 30px rgba(245,158,11,0.10) inset" }}>
                  <AlertTriangle className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <div className="ad-stat-value">{loading ? "…" : stats.totalTickets}</div>
                  <div className="ad-stat-label">Total tickets</div>
                </div>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat-row">
                <div className="ad-stat-icon" style={{ boxShadow: "0 0 0 1px rgba(168,85,247,0.22), 0 12px 30px rgba(168,85,247,0.10) inset" }}>
                  <Users className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <div className="ad-stat-value">{loading ? "…" : stats.totalUsers}</div>
                  <div className="ad-stat-label">Total users</div>
                </div>
              </div>
            </div>
          </div>

        {/* Admin Sections Grid */}
          <div className="ad-grid">
            {adminSections.map((section, index) => {
              return (
                <div key={index} className="ad-card">
                  <div className="ad-card-top">
                    <div className={`ad-card-icon bg-gradient-to-br ${getColorClasses(section.color)}`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="ad-card-title">{section.title}</h2>
                      <p className="ad-card-desc">{section.description}</p>
                    </div>
                  </div>

                  <div className="ad-links">
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        to={link.to}
                        className={`ad-link bg-gradient-to-r ${getColorClasses(section.color)}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
