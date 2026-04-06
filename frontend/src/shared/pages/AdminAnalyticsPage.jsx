import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  BarChart3, Calendar, Settings, Users, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight
} from "lucide-react";
import { dashboardService } from "../services/dashboardService";

// ─── helpers ────────────────────────────────────────────────────────────────
function clamp01(n) {
  const x = Number(n);
  return Number.isNaN(x) ? 0 : Math.max(0, Math.min(1, x));
}

// ─── Mock trend data (replace with real API calls when available) ────────────
const MONTHLY_BOOKINGS = [
  { month: "Oct", bookings: 38, tickets: 12 },
  { month: "Nov", bookings: 52, tickets: 18 },
  { month: "Dec", bookings: 31, tickets: 9 },
  { month: "Jan", bookings: 67, tickets: 22 },
  { month: "Feb", bookings: 74, tickets: 15 },
  { month: "Mar", bookings: 89, tickets: 28 },
];

const RESOURCE_TYPES = [
  { name: "Lecture Hall", value: 8, color: "#6366f1" },
  { name: "Lab", value: 12, color: "#22d3ee" },
  { name: "Meeting Room", value: 15, color: "#a855f7" },
  { name: "Equipment", value: 5, color: "#f59e0b" },
];

const DAILY_ACTIVITY = [
  { day: "Mon", active: 42, idle: 18 },
  { day: "Tue", active: 58, idle: 12 },
  { day: "Wed", active: 71, idle: 9 },
  { day: "Thu", active: 65, idle: 15 },
  { day: "Fri", active: 53, idle: 27 },
  { day: "Sat", active: 21, idle: 59 },
  { day: "Sun", active: 14, idle: 66 },
];

const TOP_RESOURCES = [
  { name: "Lab A-101", bookings: 34, type: "LAB" },
  { name: "Lecture Hall B", bookings: 28, type: "LECTURE_HALL" },
  { name: "Meeting Rm 3", bookings: 24, type: "MEETING_ROOM" },
  { name: "Lab B-202", bookings: 19, type: "LAB" },
  { name: "Projector Kit", bookings: 16, type: "EQUIPMENT" },
  { name: "Lecture Hall A", bookings: 14, type: "LECTURE_HALL" },
];

// ─── Custom tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,14,28,0.95)",
      border: "1px solid rgba(99,102,241,0.3)",
      borderRadius: 12,
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {label && <div style={{ color: "#94a3b8", marginBottom: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? "#fff", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "#cbd5e1" }}>{p.name}:</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, trendUp, tone = "indigo", delay = 0 }) {
  const colors = {
    indigo: { glow: "rgba(99,102,241,0.18)", icon: "#818cf8", glowBg: "#6366f1" },
    emerald: { glow: "rgba(16,185,129,0.18)", icon: "#34d399", glowBg: "#10b981" },
    amber: { glow: "rgba(245,158,11,0.18)", icon: "#fbbf24", glowBg: "#f59e0b" },
    purple: { glow: "rgba(168,85,247,0.18)", icon: "#c084fc", glowBg: "#a855f7" },
    rose: { glow: "rgba(244,63,94,0.18)", icon: "#fb7185", glowBg: "#f43f5e" },
  };
  const c = colors[tone] ?? colors.indigo;

  return (
    <div className="aa-stat" style={{ animationDelay: `${delay}ms` }}>
      <div className="aa-stat-glow" style={{ background: c.glowBg }} />
      <div className="aa-stat-top">
        <div className="aa-stat-icon-wrap" style={{ background: `${c.glow}`, border: `1px solid ${c.glow}` }}>
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend != null && (
          <div className={`aa-trend ${trendUp ? "aa-trend--up" : "aa-trend--down"}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}%
          </div>
        )}
      </div>
      <div className="aa-stat-value">{value}</div>
      <div className="aa-stat-label">{label}</div>
      {sub && <div className="aa-stat-sub">{sub}</div>}
    </div>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function Card({ title, sub, children, style }) {
  return (
    <div className="aa-card" style={style}>
      {title && <div className="aa-card-header">
        <div className="aa-card-title">{title}</div>
        {sub && <div className="aa-card-sub">{sub}</div>}
      </div>}
      {children}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await dashboardService.getDetailedStats();
        setStats(data);
      } catch {
        setError("Cannot reach the backend API. Make sure Spring Boot is running on port 8080.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const computed = useMemo(() => {
    const totalResources = Number(stats?.totalResources ?? 40);
    const totalBookings = Number(stats?.totalBookings ?? 89);
    const totalTickets = Number(stats?.totalTickets ?? 28);
    const totalUsers = 156;
    const utilizationRate = Math.round(clamp01((totalBookings) / Math.max(1, totalResources * 3)) * 100);
    
    // Use real resource breakdown data from backend, fallback to mock data
    const resourceBreakdown = stats?.resourceBreakdown || [
      { name: "Lecture Hall", value: 8, color: "#6366f1" },
      { name: "Lab", value: 12, color: "#22d3ee" },
      { name: "Meeting Room", value: 15, color: "#a855f7" },
      { name: "Equipment", value: 5, color: "#f59e0b" },
    ];
    
    return { totalResources, totalBookings, totalTickets, totalUsers, utilizationRate, resourceBreakdown };
  }, [stats]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        .aa-root {
          font-family: 'DM Sans', sans-serif;
          background: #080c1a;
          min-height: 100vh;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow-x: hidden;
          color: #e2e8f0;
        }
        .aa-root::before {
          content: '';
          position: fixed; top: -40%; left: -20%;
          width: 80vw; height: 80vh;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .aa-root::after {
          content: '';
          position: fixed; bottom: -30%; right: -10%;
          width: 60vw; height: 60vh;
          background: radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .aa-inner {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          animation: aa-fadein 0.45s ease both;
        }
        @keyframes aa-fadein {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .aa-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .aa-eyebrow {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #6366f1;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 0.3rem;
        }
        .aa-eyebrow::before {
          content: ''; display: inline-block;
          width: 18px; height: 2px;
          background: #6366f1; border-radius: 99px;
        }
        .aa-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800; color: #fff;
          line-height: 1.1; margin: 0;
          letter-spacing: -0.02em;
        }
        .aa-title span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .aa-subtitle { margin: 0.35rem 0 0; font-size: 13.5px; color: #6b7280; font-weight: 300; }
        .aa-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0 16px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: #cbd5e1; text-decoration: none;
          font-size: 13px; font-weight: 600;
          transition: all 0.2s;
        }
        .aa-back:hover {
          border-color: rgba(99,102,241,0.4);
          background: rgba(255,255,255,0.07);
          transform: translateY(-1px); color: #fff;
        }

        /* ── Error ── */
        .aa-error {
          margin-bottom: 1rem; border-radius: 14px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.07);
          color: #fca5a5; padding: 1rem 1.2rem; font-size: 13px;
          display: flex; align-items: center; gap: 10px;
        }

        /* ── Stat Cards ── */
        .aa-stats {
          display: grid; gap: 1rem;
          grid-template-columns: repeat(4, 1fr);
          margin-bottom: 1.25rem;
        }
        .aa-stat {
          position: relative;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 1.2rem 1.25rem 1.1rem;
          overflow: hidden; backdrop-filter: blur(12px);
          animation: aa-fadein 0.5s ease both;
          transition: border-color 0.25s, transform 0.25s;
        }
        .aa-stat:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .aa-stat-glow {
          position: absolute; top: -40px; right: -40px;
          width: 100px; height: 100px; border-radius: 50%;
          opacity: 0.12; filter: blur(28px);
        }
        .aa-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
        .aa-stat-icon-wrap {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .aa-trend {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 999px;
        }
        .aa-trend--up { background: rgba(52,211,153,0.12); color: #34d399; }
        .aa-trend--down { background: rgba(251,146,60,0.12); color: #fb923c; }
        .aa-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
          color: #fff; line-height: 1;
        }
        .aa-stat-label {
          margin-top: 0.3rem; font-size: 10.5px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #6b7280;
        }
        .aa-stat-sub { margin-top: 0.15rem; font-size: 12px; color: #4b5563; }

        /* ── Chart Cards ── */
        .aa-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.4rem 1.5rem;
          backdrop-filter: blur(14px);
          transition: border-color 0.25s;
        }
        .aa-card:hover { border-color: rgba(99,102,241,0.2); }
        .aa-card-header { margin-bottom: 1.2rem; }
        .aa-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem; font-weight: 800;
          color: #fff; margin: 0 0 0.25rem;
          letter-spacing: -0.01em;
        }
        .aa-card-sub { font-size: 12.5px; color: #4b5563; font-weight: 300; }

        /* ── Layout grids ── */
        .aa-row2 { display: grid; gap: 1rem; grid-template-columns: 1.6fr 1fr; margin-bottom: 1rem; }
        .aa-row3 { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr 1fr; margin-bottom: 1rem; }
        .aa-row2b { display: grid; gap: 1rem; grid-template-columns: 1fr 1.4fr; margin-bottom: 1rem; }

        /* ── Utilization Ring ── */
        .aa-util-wrap {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 0.4rem; padding: 1rem 0;
        }
        .aa-util-ring-label {
          font-family: 'Syne', sans-serif;
          font-size: 2.6rem; font-weight: 800; color: #fff;
          line-height: 1;
        }
        .aa-util-ring-sub { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.12em; }

        /* ── Top resources list ── */
        .aa-top-list { display: flex; flex-direction: column; gap: 0.55rem; }
        .aa-top-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.55rem 0.75rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: background 0.2s, border-color 0.2s;
        }
        .aa-top-item:hover { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.2); }
        .aa-top-rank {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 800;
          color: #4b5563; width: 16px; text-align: center; flex-shrink: 0;
        }
        .aa-top-name { font-size: 13px; font-weight: 500; color: #cbd5e1; flex: 1; }
        .aa-top-badge {
          font-size: 10px; font-weight: 600;
          padding: 2px 8px; border-radius: 999px;
          letter-spacing: 0.05em;
        }
        .aa-top-bookings {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 800; color: #fff; min-width: 26px; text-align: right;
        }
        .aa-top-bar-wrap { width: 60px; height: 5px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
        .aa-top-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #22d3ee); }

        /* ── Quick actions ── */
        .aa-actions { display: grid; gap: 0.6rem; }
        .aa-action-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 0 18px; height: 46px;
          border-radius: 14px; text-decoration: none;
          color: #fff; font-size: 13.5px; font-weight: 600;
          transition: transform 0.2s, filter 0.2s, box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .aa-action-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .aa-action-btn svg { flex-shrink: 0; }
        .aa-action-btn-label { flex: 1; }
        .aa-action-arrow { opacity: 0.6; }

        /* ── Recharts overrides ── */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,0.05); }
        .recharts-text { fill: #6b7280 !important; font-size: 11px !important; font-family: 'DM Sans', sans-serif !important; }
        .recharts-tooltip-cursor { fill: rgba(99,102,241,0.06); }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .aa-stats { grid-template-columns: repeat(2, 1fr); }
          .aa-row2 { grid-template-columns: 1fr; }
          .aa-row2b { grid-template-columns: 1fr; }
          .aa-row3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 680px) {
          .aa-stats { grid-template-columns: 1fr 1fr; }
          .aa-row3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .aa-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="aa-root">
        <div className="aa-inner">

          {/* ── Header ── */}
          <div className="aa-header">
            <div>
              <div className="aa-eyebrow">Admin Panel</div>
              <h1 className="aa-title">System <span>Analytics</span></h1>
              <p className="aa-subtitle">Live overview of resources, bookings, tickets and usage trends.</p>
            </div>
            <Link to="/admin/dashboard" className="aa-back">
              ← Back to dashboard
            </Link>
          </div>

          {error && <div className="aa-error">⚠️ {error}</div>}

          {/* ── Stat row ── */}
          <div className="aa-stats">
            <StatCard icon={Settings}      label="Total Resources"  value={loading ? "…" : computed.totalResources} sub="Lecture halls, labs & more" trend={4}  trendUp tone="indigo" delay={0}   />
            <StatCard icon={Calendar}      label="Total Bookings"   value={loading ? "…" : computed.totalBookings}  sub="All time bookings"          trend={12} trendUp tone="emerald" delay={80}  />
            <StatCard icon={AlertTriangle} label="Open Tickets"     value={loading ? "…" : computed.totalTickets}   sub="Pending review"             trend={3}  trendUp={false} tone="amber" delay={160} />
            <StatCard icon={Users}         label="Registered Users" value={loading ? "…" : computed.totalUsers}     sub="Active accounts"            trend={8}  trendUp tone="purple" delay={240} />
          </div>

          {/* ── Row 1: Bookings trend (area) + Resource type pie ── */}
          <div className="aa-row2" style={{ marginBottom: "1rem" }}>
            <Card title="Bookings & Tickets — 6 Month Trend" sub="Monthly volume over the last 6 months">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_BOOKINGS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gbookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gtickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#818cf8" strokeWidth={2.5} fill="url(#gbookings)" dot={false} activeDot={{ r: 5, fill: "#818cf8" }} />
                  <Area type="monotone" dataKey="tickets"  name="Tickets"  stroke="#fbbf24" strokeWidth={2}   fill="url(#gtickets)"  dot={false} activeDot={{ r: 5, fill: "#fbbf24" }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Resource Breakdown" sub="By type across all campus">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={computed.resourceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {computed.resourceBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 1.2rem", width: "100%" }}>
                  {computed.resourceBreakdown.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{r.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ── Row 2: Daily activity bar chart + Utilization ring + Top resources ── */}
          <div className="aa-row3" style={{ marginBottom: "1rem" }}>
            <Card title="Weekly Activity" sub="Active vs idle resources by day" style={{ gridColumn: "span 2" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={DAILY_ACTIVITY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                  <Bar dataKey="active" name="Active" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="idle"   name="Idle"   fill="rgba(255,255,255,0.08)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Utilization Rate" sub="Bookings per resource capacity">
              <div className="aa-util-wrap">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: computed.utilizationRate, name: "Used" },
                        { value: 100 - computed.utilizationRate, name: "Free" },
                      ]}
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={50}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="rgba(255,255,255,0.06)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: "-1rem", textAlign: "center" }}>
                  <div className="aa-util-ring-label">{loading ? "…" : `${computed.utilizationRate}%`}</div>
                  <div className="aa-util-ring-sub">Utilization</div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Row 3: Top resources + Quick actions ── */}
          <div className="aa-row2b">
            <Card title="Top Booked Resources" sub="Most popular spaces and equipment this semester">
              <div className="aa-top-list">
                {TOP_RESOURCES.map((r, i) => {
                  const max = TOP_RESOURCES[0].bookings;
                  const typeColors = {
                    LAB: { bg: "rgba(6,182,212,0.12)", text: "#22d3ee" },
                    LECTURE_HALL: { bg: "rgba(99,102,241,0.12)", text: "#818cf8" },
                    MEETING_ROOM: { bg: "rgba(168,85,247,0.12)", text: "#c084fc" },
                    EQUIPMENT: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
                  };
                  const tc = typeColors[r.type] ?? typeColors.EQUIPMENT;
                  return (
                    <div key={i} className="aa-top-item">
                      <span className="aa-top-rank">#{i + 1}</span>
                      <span className="aa-top-name">{r.name}</span>
                      <span className="aa-top-badge" style={{ background: tc.bg, color: tc.text }}>{r.type.replace("_", " ")}</span>
                      <div className="aa-top-bar-wrap">
                        <div className="aa-top-bar" style={{ width: `${(r.bookings / max) * 100}%` }} />
                      </div>
                      <span className="aa-top-bookings">{r.bookings}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Quick Actions" sub="Jump to key admin areas">
              <div className="aa-actions">
                {[
                  { to: "/admin/resources",  label: "Manage Resources",  icon: Settings,       bg: "linear-gradient(135deg,#6366f1,#4f46e5)" },
                  { to: "/bookings/admin",   label: "Manage Bookings",   icon: Calendar,       bg: "linear-gradient(135deg,#10b981,#059669)" },
                  { to: "/incidents/admin",  label: "Manage Tickets",    icon: AlertTriangle,  bg: "linear-gradient(135deg,#f59e0b,#ea580c)" },
                  { to: "/admin/users",      label: "Manage Users",      icon: Users,          bg: "linear-gradient(135deg,#a855f7,#6366f1)" },
                  { to: "/admin/dashboard",  label: "Back to Dashboard", icon: BarChart3,      bg: "linear-gradient(135deg,#334155,#1e293b)" },
                ].map(({ to, label, icon: Icon, bg }) => (
                  <Link key={to} to={to} className="aa-action-btn" style={{ background: bg }}>
                    <Icon size={16} />
                    <span className="aa-action-btn-label">{label}</span>
                    <ArrowUpRight size={14} className="aa-action-arrow" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}