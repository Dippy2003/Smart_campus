import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResourceTable from "../components/ResourceTable";
import { deleteResource, getAllResources } from "../services/resourceApi";
import { exportResourcesToCsv } from "../utils/resourceExport";
import { useToast } from "../../../shared/components/ToastProvider";

export default function AdminResourcesPage() {
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const onDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    setError("");
    try {
      await deleteResource(id);
      await loadAll();
      toast.success("Resource deleted.");
    } catch (e) {
      const isConflict = e.response?.status === 409;
      const msg = isConflict
        ? "Cannot delete this resource because it has related bookings. Remove those bookings first."
        : e.response?.data?.message ||
          e.response?.data?.error ||
          "Delete failed. Check that the backend is running and reachable.";
      setError(msg);
      toast.error(msg);
    }
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

  const handleExportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    exportResourcesToCsv(resources, `admin-resources-${stamp}.csv`);
    toast.success("CSV downloaded.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .arp-root {
          font-family: 'DM Sans', sans-serif;
          background: #080c1a;
          min-height: 100vh;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow-x: hidden;
        }

        .arp-root::before {
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
        .arp-root::after {
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

        .arp-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          animation: arp-fade-in 0.5s ease both;
        }

        @keyframes arp-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ─────────────────────────────── */
        .arp-header {
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .arp-header-left {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .arp-header-eyebrow {
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
        .arp-header-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 2px;
          background: #6366f1;
          border-radius: 99px;
        }
        .arp-header h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .arp-header h1 span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .arp-header p {
          margin: 0.35rem 0 0;
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }

        .arp-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 20px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .arp-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
          background: linear-gradient(135deg, #818cf8, #6366f1);
        }
        .arp-add-btn:active {
          transform: translateY(0);
        }

        .arp-header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .arp-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          height: 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #d1d5db;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .arp-export-btn:hover:not(:disabled) {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.35);
          color: #e0e7ff;
        }
        .arp-export-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Stat Cards ──────────────────────────── */
        .arp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .arp-stat {
          position: relative;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.1rem 1.3rem;
          overflow: hidden;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, transform 0.25s;
        }
        .arp-stat:hover {
          border-color: rgba(99,102,241,0.35);
          transform: translateY(-2px);
        }
        .arp-stat-glow {
          position: absolute;
          top: -30px; right: -30px;
          width: 90px; height: 90px;
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(24px);
        }
        .arp-stat-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .arp-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          position: relative;
        }
        .arp-stat--total  .arp-stat-value { color: #e2e8f0; }
        .arp-stat--total  .arp-stat-glow  { background: #818cf8; }
        .arp-stat--active .arp-stat-value { color: #34d399; }
        .arp-stat--active .arp-stat-glow  { background: #34d399; }
        .arp-stat--out    .arp-stat-value { color: #fb923c; }
        .arp-stat--out    .arp-stat-glow  { background: #fb923c; }

        .arp-stat-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle;
        }

        /* ── Loading / Error ─────────────────────── */
        .arp-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1.5rem;
          color: #6b7280;
          font-size: 13px;
        }
        .arp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: arp-spin 0.7s linear infinite;
        }
        @keyframes arp-spin {
          to { transform: rotate(360deg); }
        }

        .arp-error {
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

        /* ── Results bar ─────────────────────────── */
        .arp-results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
          padding: 0 2px;
        }
        .arp-results-count {
          font-size: 12.5px;
          color: #4b5563;
          font-weight: 400;
        }
        .arp-results-count strong {
          color: #9ca3af;
          font-weight: 600;
        }

        /* ── Responsive ──────────────────────────── */
        @media (max-width: 768px) {
          .arp-stats {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
          .arp-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="arp-root">
        <div className="arp-inner">

          {/* Header */}
          <div className="arp-header">
            <div className="arp-header-left">
              <div className="arp-header-eyebrow">Admin Panel</div>
              <h1>Manage <span>Resources</span></h1>
              <p>Manage, edit, and remove resources from the system.</p>
            </div>

            <div className="arp-header-actions">
              <Link to="/resources/calendar" className="arp-export-btn" title="Open monthly booking calendar">
                Booking Calendar
              </Link>
              <button
                type="button"
                className="arp-export-btn"
                disabled={resources.length === 0 || loading}
                onClick={handleExportCsv}
                title="Download all resources as CSV"
              >
                Export CSV
              </button>
              <Link to="/admin/resources/new" className="arp-add-btn">
                + Add Resource
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="arp-stats">
            <div className="arp-stat arp-stat--total">
              <div className="arp-stat-glow" />
              <div className="arp-stat-label">
                <span className="arp-stat-dot" style={{ background: "#818cf8" }} />
                Total Resources
              </div>
              <div className="arp-stat-value">{stats.total}</div>
            </div>
            <div className="arp-stat arp-stat--active">
              <div className="arp-stat-glow" />
              <div className="arp-stat-label">
                <span className="arp-stat-dot" style={{ background: "#34d399" }} />
                Active
              </div>
              <div className="arp-stat-value">{stats.active}</div>
            </div>
            <div className="arp-stat arp-stat--out">
              <div className="arp-stat-glow" />
              <div className="arp-stat-label">
                <span className="arp-stat-dot" style={{ background: "#fb923c" }} />
                Out of Service
              </div>
              <div className="arp-stat-value">{stats.out}</div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="arp-loading">
              <div className="arp-spinner" />
              Fetching resources…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="arp-error">
              ⚠️ {error}
            </div>
          )}

          {/* Results bar */}
          {!loading && !error && (
            <div className="arp-results-bar">
              <p className="arp-results-count">
                Showing <strong>{resources.length}</strong> resource{resources.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <ResourceTable
            resources={resources}
            showAdminActions={true}
            onDelete={onDelete}
          />

        </div>
      </div>
    </>
  );
}