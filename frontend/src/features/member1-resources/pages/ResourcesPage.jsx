import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResourceTable from "../components/ResourceTable";
import ResourceCard from "../components/ResourceCard";
import { getAllResources } from "../services/resourceApi";
import { exportResourcesToCsv } from "../utils/resourceExport";
import { useToast } from "../../../shared/components/ToastProvider";

const TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["", "ACTIVE", "OUT_OF_SERVICE"];
const SORTS = [
  { key: "name-asc", label: "Name (A–Z)" },
  { key: "name-desc", label: "Name (Z–A)" },
  { key: "capacity-desc", label: "Capacity (high → low)" },
  { key: "capacity-asc", label: "Capacity (low → high)" },
  { key: "status-asc", label: "Status" },
];

const TYPE_META = {
  LECTURE_HALL: { icon: "🎓", color: "#6366f1" },
  LAB: { icon: "🔬", color: "#06b6d4" },
  MEETING_ROOM: { icon: "🤝", color: "#8b5cf6" },
  EQUIPMENT: { icon: "🛠️", color: "#f59e0b" },
};

export default function ResourcesPage() {
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [view, setView] = useState("table");
  const [sortKey, setSortKey] = useState("name-asc");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllResources();
      setResources(res.data ?? []);
    } catch (e) {
      setError("Cannot reach the backend API. Make sure Spring Boot is running on port 8080.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setKeyword("");
    setType("");
    setStatus("");
    setLocation("");
  };

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r.status === "ACTIVE").length;
    const out = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;
    return { total, active, out };
  }, [resources]);

  const filteredResources = useMemo(() => {
    let list = [...resources];
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(kw)) ||
          (r.location && r.location.toLowerCase().includes(kw))
      );
    }
    if (type) list = list.filter((r) => r.type === type);
    if (status) list = list.filter((r) => r.status === status);
    if (location.trim()) {
      const loc = location.trim().toLowerCase();
      list = list.filter((r) => r.location && r.location.toLowerCase().includes(loc));
    }
    return list;
  }, [resources, keyword, type, status, location]);

  const sortedResources = useMemo(() => {
    const list = [...filteredResources];
    const byText = (a, b) => String(a ?? "").localeCompare(String(b ?? ""));
    switch (sortKey) {
      case "name-desc": list.sort((a, b) => byText(b.name, a.name)); break;
      case "capacity-desc": list.sort((a, b) => (Number(b.capacity) || 0) - (Number(a.capacity) || 0)); break;
      case "capacity-asc": list.sort((a, b) => (Number(a.capacity) || 0) - (Number(b.capacity) || 0)); break;
      case "status-asc": list.sort((a, b) => byText(a.status, b.status) || byText(a.name, b.name)); break;
      case "name-asc": default: list.sort((a, b) => byText(a.name, b.name)); break;
    }
    return list;
  }, [filteredResources, sortKey]);

  const hasActiveFilters = keyword || type || status || location;

  const filterSummaryPrint = useMemo(() => {
    const parts = [];
    if (keyword.trim()) parts.push(`Keyword: "${keyword.trim()}"`);
    if (type) parts.push(`Type: ${type.replace(/_/g, " ")}`);
    if (status) parts.push(`Status: ${status.replace(/_/g, " ")}`);
    if (location.trim()) parts.push(`Location: "${location.trim()}"`);
    return parts.length ? parts.join(" · ") : "No filters (full list)";
  }, [keyword, type, status, location]);

  const sortLabel = useMemo(
    () => SORTS.find((s) => s.key === sortKey)?.label ?? sortKey,
    [sortKey]
  );

  const handleExportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    exportResourcesToCsv(sortedResources, `campus-resources-${stamp}.csv`);
    toast.success("CSV downloaded.");
  };

  const handlePrintList = () => {
    toast.info("Opening print dialog…");
    window.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .rp-root {
          font-family: 'DM Sans', sans-serif;
          background: #080c1a;
          min-height: 100vh;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow-x: hidden;
        }

        .rp-root::before {
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
        .rp-root::after {
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

        .rp-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          animation: rp-fade-in 0.5s ease both;
        }

        @keyframes rp-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ─────────────────────────────── */
        .rp-header {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .rp-header-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rp-header-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 2px;
          background: #6366f1;
          border-radius: 99px;
        }
        .rp-header h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .rp-header h1 span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rp-header p {
          margin: 0.35rem 0 0;
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }

        /* ── Stat Cards ──────────────────────────── */
        .rp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .rp-stat {
          position: relative;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.1rem 1.3rem;
          overflow: hidden;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, transform 0.25s;
        }
        .rp-stat:hover {
          border-color: rgba(99,102,241,0.35);
          transform: translateY(-2px);
        }
        .rp-stat-glow {
          position: absolute;
          top: -30px; right: -30px;
          width: 90px; height: 90px;
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(24px);
        }
        .rp-stat-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .rp-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          position: relative;
        }
        .rp-stat--total  .rp-stat-value { color: #e2e8f0; }
        .rp-stat--total  .rp-stat-glow  { background: #818cf8; }
        .rp-stat--active .rp-stat-value { color: #34d399; }
        .rp-stat--active .rp-stat-glow  { background: #34d399; }
        .rp-stat--out    .rp-stat-value { color: #fb923c; }
        .rp-stat--out    .rp-stat-glow  { background: #fb923c; }

        .rp-stat-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle;
        }

        /* ── Filter Panel ────────────────────────── */
        .rp-filters {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.4rem 1.5rem;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(16px);
          display: grid;
          gap: 1rem;
        }
        .rp-filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 0.75rem;
        }
        .rp-filter-row--bottom {
          grid-template-columns: 1fr auto;
          align-items: end;
        }
        .rp-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .rp-field-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #6366f1;
        }
        .rp-input {
          height: 38px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
          width: 100%;
          box-sizing: border-box;
        }
        .rp-input::placeholder { color: #4b5563; }
        .rp-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: rgba(255,255,255,0.09);
        }
        select.rp-input {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px;
        }
        select.rp-input option {
          background: #111827;
          color: #e2e8f0;
        }

        /* ── Bottom bar: sort + view + clear ──────── */
        .rp-bottom-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .rp-sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 160px;
        }
        .rp-sort-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #6366f1;
          white-space: nowrap;
        }
        .rp-sort-wrap select.rp-input {
          max-width: 220px;
        }

        /* ── View Toggle ─────────────────────────── */
        .rp-view-toggle {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 3px;
          overflow: hidden;
        }
        .rp-view-btn {
          padding: 5px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          display: flex; align-items: center; gap: 5px;
        }
        .rp-view-btn--active {
          background: #6366f1;
          color: #fff;
          box-shadow: 0 2px 8px rgba(99,102,241,0.35);
        }
        .rp-view-btn--inactive {
          background: transparent;
          color: #6b7280;
        }
        .rp-view-btn--inactive:hover { color: #d1d5db; }

        /* ── Clear Btn ───────────────────────────── */
        .rp-clear-btn {
          height: 36px;
          padding: 0 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rp-clear-btn:hover:not(:disabled) {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .rp-clear-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .rp-active-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px; height: 16px;
          background: #6366f1;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 700;
          color: #fff;
        }

        /* ── Results bar ─────────────────────────── */
        .rp-results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.85rem;
          padding: 0 2px;
        }
        .rp-results-count {
          font-size: 12.5px;
          color: #4b5563;
          font-weight: 400;
        }
        .rp-results-count strong {
          color: #9ca3af;
          font-weight: 600;
        }

        /* ── Loading / Error ─────────────────────── */
        .rp-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1.5rem;
          color: #6b7280;
          font-size: 13px;
        }
        .rp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: rp-spin 0.7s linear infinite;
        }
        @keyframes rp-spin {
          to { transform: rotate(360deg); }
        }

        .rp-error {
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,0.25);
          background: rgba(239,68,68,0.07);
          padding: 1rem 1.2rem;
          font-size: 13px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1rem;
        }

        /* ── Empty state ─────────────────────────── */
        .rp-empty {
          border-radius: 16px;
          border: 1px dashed rgba(255,255,255,0.08);
          padding: 3rem 2rem;
          text-align: center;
          color: #4b5563;
          font-size: 14px;
          background: rgba(255,255,255,0.015);
        }
        .rp-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          opacity: 0.4;
        }

        /* ── Cards grid wrapper ──────────────────── */
        .rp-cards-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        /* ── Responsive ──────────────────────────── */
        @media (max-width: 768px) {
          .rp-filter-row {
            grid-template-columns: 1fr 1fr;
          }
          .rp-stats {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
        }
        @media (max-width: 480px) {
          .rp-filter-row { grid-template-columns: 1fr; }
          .rp-bottom-bar { flex-direction: column; align-items: stretch; }
          .rp-sort-wrap { flex-direction: column; align-items: flex-start; }
        }

        /* Export / print */
        .rp-export-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .rp-export-btn {
          height: 34px;
          padding: 0 14px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #d1d5db;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .rp-export-btn:hover:not(:disabled) {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.35);
          color: #e0e7ff;
        }
        .rp-export-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .rp-export-btn--primary {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.35);
          color: #c7d2fe;
        }

        .rp-print-only { display: none; }

        @media print {
          .rp-print-hide { display: none !important; }
          .rp-main-view { display: none !important; }
          .rp-print-only {
            display: block !important;
            font-family: Georgia, 'Times New Roman', serif;
            color: #111;
            padding: 0;
          }
          .rp-root {
            background: #fff !important;
            min-height: auto !important;
            padding: 0.75in !important;
          }
          .rp-inner { max-width: 100% !important; animation: none !important; }
          .rp-print-title {
            font-size: 18pt;
            margin: 0 0 8pt;
            font-weight: 700;
            border-bottom: 2pt solid #333;
            padding-bottom: 6pt;
          }
          .rp-print-meta {
            font-size: 9pt;
            color: #444;
            margin: 4pt 0;
            line-height: 1.35;
          }
          .rp-print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12pt;
            font-size: 9pt;
          }
          .rp-print-table th,
          .rp-print-table td {
            border: 1px solid #999;
            padding: 6pt 8pt;
            text-align: left;
            vertical-align: top;
          }
          .rp-print-table th {
            background: #f0f0f0;
            font-weight: 600;
          }
          .rp-print-table tr:nth-child(even) td { background: #fafafa; }
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-inner">

          {/* Header */}
          <div className="rp-header rp-print-hide">
            <div className="rp-header-eyebrow">Student Portal</div>
            <h1>Campus <span>Resources</span></h1>
            <p>Browse, search, and filter all available spaces and equipment on campus.</p>
          </div>

          {/* Stats */}
          <div className="rp-stats rp-print-hide">
            <div className="rp-stat rp-stat--total">
              <div className="rp-stat-glow" />
              <div className="rp-stat-label">
                <span className="rp-stat-dot" style={{ background: "#818cf8" }} />
                Total Resources
              </div>
              <div className="rp-stat-value">{stats.total}</div>
            </div>
            <div className="rp-stat rp-stat--active">
              <div className="rp-stat-glow" />
              <div className="rp-stat-label">
                <span className="rp-stat-dot" style={{ background: "#34d399" }} />
                Active
              </div>
              <div className="rp-stat-value">{stats.active}</div>
            </div>
            <div className="rp-stat rp-stat--out">
              <div className="rp-stat-glow" />
              <div className="rp-stat-label">
                <span className="rp-stat-dot" style={{ background: "#fb923c" }} />
                Out of Service
              </div>
              <div className="rp-stat-value">{stats.out}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="rp-filters rp-print-hide">
            <div className="rp-filter-row">
              <div className="rp-field" style={{ gridColumn: "span 2" }}>
                <span className="rp-field-label">🔍 Keyword</span>
                <input
                  className="rp-input"
                  placeholder="Search by name or location…"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="rp-field">
                <span className="rp-field-label">Type</span>
                <select
                  className="rp-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t || "none"} value={t}>
                      {t ? `${TYPE_META[t]?.icon ?? ""} ${t.replace(/_/g, " ")}` : "Any type"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rp-field">
                <span className="rp-field-label">Status</span>
                <select
                  className="rp-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s || "none"} value={s}>
                      {s ? s.replace(/_/g, " ") : "Any status"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rp-filter-row">
              <div className="rp-field">
                <span className="rp-field-label">📍 Location</span>
                <input
                  className="rp-input"
                  placeholder="Filter by location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="rp-field" style={{ gridColumn: "2 / -1" }} />
            </div>

            {/* Bottom bar */}
            <div className="rp-bottom-bar">
              <div className="rp-sort-wrap">
                <span className="rp-sort-label">Sort</span>
                <select
                  className="rp-input"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="rp-view-toggle">
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={`rp-view-btn ${view === "table" ? "rp-view-btn--active" : "rp-view-btn--inactive"}`}
                >
                  ☰ Table
                </button>
                <button
                  type="button"
                  onClick={() => setView("cards")}
                  className={`rp-view-btn ${view === "cards" ? "rp-view-btn--active" : "rp-view-btn--inactive"}`}
                >
                  ⊞ Cards
                </button>
              </div>

              <button
                type="button"
                onClick={clear}
                disabled={loading}
                className="rp-clear-btn"
              >
                {hasActiveFilters && <span className="rp-active-badge">!</span>}
                Clear filters
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rp-loading rp-print-hide">
              <div className="rp-spinner" />
              Fetching resources…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rp-error rp-print-hide">
              ⚠️ {error}
            </div>
          )}

          {/* Results bar */}
          {!loading && !error && (
            <div className="rp-results-bar rp-print-hide">
              <p className="rp-results-count">
                Showing <strong>{sortedResources.length}</strong> of <strong>{resources.length}</strong> resources
              </p>
              <div className="rp-export-actions">
                <Link
                  to="/resources/calendar"
                  className="rp-export-btn"
                  title="Open monthly booking calendar"
                >
                  Booking Calendar
                </Link>
                <button
                  type="button"
                  className="rp-export-btn rp-export-btn--primary"
                  disabled={sortedResources.length === 0}
                  onClick={handleExportCsv}
                  title="Download the current filtered & sorted list as CSV"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="rp-export-btn"
                  disabled={sortedResources.length === 0}
                  onClick={handlePrintList}
                  title="Open print dialog for a clean list"
                >
                  Print list
                </button>
              </div>
            </div>
          )}

          {/* Print-only: simple table (same data as filtered/sorted list) */}
          <div className="rp-print-only">
            <h1 className="rp-print-title">Campus resources</h1>
            <p className="rp-print-meta">
              Generated {new Date().toLocaleString()} · Sort: {sortLabel}
            </p>
            <p className="rp-print-meta">Filters: {filterSummaryPrint}</p>
            <p className="rp-print-meta">
              Rows: {sortedResources.length} (of {resources.length} total in system)
            </p>
            <table className="rp-print-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Availability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedResources.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{String(r.type ?? "").replace(/_/g, " ")}</td>
                    <td>{r.capacity}</td>
                    <td>{r.location}</td>
                    <td>
                      {r.availabilityStart} – {r.availabilityEnd}
                    </td>
                    <td>{String(r.status ?? "").replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results */}
          <div className="rp-main-view">
          {view === "cards" ? (
            <div className="rp-cards-grid">
              {sortedResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
              {sortedResources.length === 0 && !loading && (
                <div className="rp-empty" style={{ gridColumn: "1 / -1" }}>
                  <div className="rp-empty-icon">🔭</div>
                  No resources found. Try adjusting your filters.
                </div>
              )}
            </div>
          ) : (
            <>
              <ResourceTable resources={sortedResources} showAdminActions={false} />
              {sortedResources.length === 0 && !loading && (
                <div className="rp-empty">
                  <div className="rp-empty-icon">🔭</div>
                  No resources found. Try adjusting your filters.
                </div>
              )}
            </>
          )}
          </div>

        </div>
      </div>
    </>
  );
}