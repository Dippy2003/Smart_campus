import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResourceById } from "../services/resourceApi";

const TYPE_META = {
  LECTURE_HALL: { icon: "🎓", color: "#6366f1" },
  LAB:          { icon: "🔬", color: "#06b6d4" },
  MEETING_ROOM: { icon: "🤝", color: "#8b5cf6" },
  EQUIPMENT:    { icon: "🛠️", color: "#f59e0b" },
};

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getResourceById(id);
        setResource(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .rd {
          font-family: 'Outfit', sans-serif;
          background: #0a0d14;
          min-height: 100vh;
          padding: 1.25rem 1.5rem 3rem;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }
        .rd::before {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.5;
        }

        .rd-wrap {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          animation: rd-in .4s ease both;
        }
        @keyframes rd-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Back link ── */
        .rd-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 600; letter-spacing: .05em;
          color: #4b5563; text-decoration: none;
          margin-bottom: 1rem;
          transition: color .15s;
        }
        .rd-back:hover { color: #818cf8; }
        .rd-back svg { transition: transform .15s; }
        .rd-back:hover svg { transform: translateX(-3px); }

        /* ── Header ── */
        .rd-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;
        }
        .rd-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase;
          color: #6366f1; display: flex; align-items: center; gap: 6px; margin-bottom: 3px;
        }
        .rd-eyebrow span { width: 18px; height: 1.5px; background: #6366f1; display: inline-block; border-radius: 99px; }
        .rd-h1 {
          font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800;
          letter-spacing: -.03em; line-height: 1.1; color: #f8fafc; margin: 0;
        }

        /* ID badge */
        .rd-id-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px; padding: 5px 12px;
          font-family: 'JetBrains Mono', monospace; font-size: 11.5px;
          color: #6b7280; white-space: nowrap; flex-shrink: 0; align-self: flex-start;
          margin-top: 4px;
        }

        /* ── Type + Status strip ── */
        .rd-strip {
          display: flex; gap: .6rem; align-items: center; flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .rd-chip {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 8px; padding: 5px 12px;
          font-size: 11.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
          border: 1px solid transparent;
        }
        .rd-chip--type {
          background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.25); color: #a5b4fc;
        }
        .rd-chip--active {
          background: rgba(52,211,153,.08); border-color: rgba(52,211,153,.25); color: #34d399;
        }
        .rd-chip--oos {
          background: rgba(251,146,60,.08); border-color: rgba(251,146,60,.25); color: #fb923c;
        }

        /* ── Info grid ── */
        .rd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: .6rem;
          margin-bottom: 1.25rem;
        }
        .rd-card {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px; padding: .9rem 1.1rem;
          transition: border-color .2s, transform .2s;
        }
        .rd-card:hover { border-color: rgba(99,102,241,.3); transform: translateY(-1px); }
        .rd-card-lbl {
          font-size: 9.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          color: #4b5563; margin-bottom: 5px;
          display: flex; align-items: center; gap: 5px;
        }
        .rd-card-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem; font-weight: 500; color: #e2e8f0; line-height: 1.3;
        }
        .rd-card-val--big {
          font-size: 1.6rem; font-weight: 500; color: #c7d2fe;
        }

        /* ── Availability bar ── */
        .rd-avail {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px; padding: .9rem 1.1rem;
          grid-column: span 2;
          display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
        }
        .rd-avail-lbl {
          font-size: 9.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          color: #4b5563; white-space: nowrap;
        }
        .rd-avail-times {
          display: flex; align-items: center; gap: .6rem; flex-wrap: wrap;
        }
        .rd-time {
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.2);
          border-radius: 7px; padding: 4px 10px; color: #a5b4fc;
        }
        .rd-time-sep { color: #374151; font-size: 12px; }

        /* ── Loading / error ── */
        .rd-loading { display: flex; align-items: center; gap: 8px; padding: 2rem; color: #6b7280; font-size: 13px; }
        .rd-spin { width: 14px; height: 14px; border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rd-err { border-radius: 10px; border: 1px solid rgba(239,68,68,.2); background: rgba(239,68,68,.06); padding: .75rem 1rem; font-size: 12.5px; color: #fca5a5; }

        @media (max-width: 480px) {
          .rd-avail { grid-column: span 1; }
        }
      `}</style>

      <div className="rd">
        <div className="rd-wrap">

          {/* Back */}
          <Link to="/resources" className="rd-back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Resources
          </Link>

          {/* Loading */}
          {loading && (
            <div className="rd-loading">
              <div className="rd-spin" /> Loading resource…
            </div>
          )}

          {/* Not found */}
          {!loading && !resource && (
            <div className="rd-err">⚠️ Resource not found.</div>
          )}

          {/* Content */}
          {!loading && resource && (() => {
            const meta = TYPE_META[resource.type] ?? { icon: "📦", color: "#6b7280" };
            const isActive = resource.status === "ACTIVE";
            return (
              <>
                {/* Header */}
                <div className="rd-header">
                  <div>
                    <div className="rd-eyebrow"><span />Resource Details</div>
                    <h1 className="rd-h1">{resource.name}</h1>
                  </div>
                  <div className="rd-id-badge"># {resource.id}</div>
                </div>

                {/* Type + Status chips */}
                <div className="rd-strip">
                  <span className="rd-chip rd-chip--type">
                    {meta.icon} {resource.type?.replace(/_/g, " ")}
                  </span>
                  <span className={`rd-chip ${isActive ? "rd-chip--active" : "rd-chip--oos"}`}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#34d399" : "#fb923c", display: "inline-block" }} />
                    {resource.status?.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Info cards */}
                <div className="rd-grid">
                  <div className="rd-card">
                    <div className="rd-card-lbl">📍 Location</div>
                    <div className="rd-card-val">{resource.location || "—"}</div>
                  </div>

                  <div className="rd-card">
                    <div className="rd-card-lbl">👥 Capacity</div>
                    <div className="rd-card-val rd-card-val--big">{resource.capacity ?? "—"}</div>
                  </div>

                  <div className="rd-avail">
                    <div className="rd-avail-lbl">🕐 Availability</div>
                    <div className="rd-avail-times">
                      <span className="rd-time">{resource.availabilityStart || "—"}</span>
                      <span className="rd-time-sep">→</span>
                      <span className="rd-time">{resource.availabilityEnd || "—"}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

        </div>
      </div>
    </>
  );
}