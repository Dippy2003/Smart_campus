import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResourceForm from "../components/ResourceForm";
import { getResourceById, updateResource } from "../services/resourceApi";

export default function EditResourcePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getResourceById(id);
        setInitialValues(res.data);
      } catch {
        setInitialValues({ _notFound: true });
      }
    })();
  }, [id]);

  const submit = async (data) => {
    setError("");
    try {
      await updateResource(id, data);
      nav("/admin/resources");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update resource. Check backend is running.");
    }
  };

  if (initialValues?._notFound) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

          .edit-root {
            font-family: 'DM Sans', sans-serif;
            background: #080c1a;
            min-height: 100vh;
            padding: 2rem 1.5rem 4rem;
            position: relative;
            overflow-x: hidden;
          }

          .edit-root::before {
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
          .edit-root::after {
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

          .edit-inner {
            position: relative;
            z-index: 1;
            max-width: 980px;
            margin: 0 auto;
            animation: edit-fade-in 0.5s ease both;
          }
          @keyframes edit-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .edit-header {
            margin-bottom: 1.25rem;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
          }
          .edit-header-left { display: flex; flex-direction: column; gap: 0.3rem; }
          .edit-eyebrow {
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #6366f1;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .edit-eyebrow::before {
            content: '';
            display: inline-block;
            width: 18px;
            height: 2px;
            background: #6366f1;
            border-radius: 999px;
          }
          .edit-title {
            font-family: 'Syne', sans-serif;
            font-size: clamp(1.6rem, 3.5vw, 2.2rem);
            font-weight: 800;
            color: #fff;
            line-height: 1.1;
            margin: 0;
            letter-spacing: -0.02em;
          }
          .edit-title span {
            background: linear-gradient(90deg, #818cf8, #22d3ee);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .edit-subtitle {
            margin: 0.35rem 0 0;
            font-size: 13.5px;
            color: #6b7280;
            font-weight: 300;
          }

          .edit-back {
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
          .edit-back:hover {
            border-color: rgba(99,102,241,0.35);
            background: rgba(255,255,255,0.06);
            transform: translateY(-1px);
            color: #fff;
          }

          .edit-card {
            background: rgba(255,255,255,0.035);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 18px;
            padding: 1.15rem 1.1rem;
            backdrop-filter: blur(12px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          }

          .edit-empty {
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.03);
            color: #cbd5e1;
            padding: 1rem;
            font-size: 13px;
          }

          @media (min-width: 640px) {
            .edit-card { padding: 1.35rem 1.4rem; }
          }
        `}</style>

        <div className="edit-root">
          <div className="edit-inner">
            <div className="edit-header">
              <div className="edit-header-left">
                <div className="edit-eyebrow">Admin</div>
                <h1 className="edit-title">
                  Edit <span>resource</span>
                </h1>
                <p className="edit-subtitle">That resource doesn’t exist (or was deleted).</p>
              </div>
              <Link to="/admin/resources" className="edit-back">
                ← Back to resources
              </Link>
            </div>

            <div className="edit-card">
              <div className="edit-empty">Resource not found.</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!initialValues) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

          .edit-root {
            font-family: 'DM Sans', sans-serif;
            background: #080c1a;
            min-height: 100vh;
            padding: 2rem 1.5rem 4rem;
            position: relative;
            overflow-x: hidden;
          }
          .edit-root::before {
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
          .edit-root::after {
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
          .edit-inner {
            position: relative;
            z-index: 1;
            max-width: 980px;
            margin: 0 auto;
            animation: edit-fade-in 0.5s ease both;
          }
          @keyframes edit-fade-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .edit-card {
            background: rgba(255,255,255,0.035);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 18px;
            padding: 1.15rem 1.1rem;
            backdrop-filter: blur(12px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.35);
            color: #cbd5e1;
            font-size: 13px;
          }
        `}</style>

        <div className="edit-root">
          <div className="edit-inner">
            <div className="edit-card">Loading resource…</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .edit-root {
          font-family: 'DM Sans', sans-serif;
          background: #080c1a;
          min-height: 100vh;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow-x: hidden;
        }

        .edit-root::before {
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
        .edit-root::after {
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

        .edit-inner {
          position: relative;
          z-index: 1;
          max-width: 980px;
          margin: 0 auto;
          animation: edit-fade-in 0.5s ease both;
        }
        @keyframes edit-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .edit-header {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .edit-header-left { display: flex; flex-direction: column; gap: 0.3rem; }
        .edit-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .edit-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 2px;
          background: #6366f1;
          border-radius: 999px;
        }
        .edit-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .edit-title span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .edit-subtitle {
          margin: 0.35rem 0 0;
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }

        .edit-back {
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
        .edit-back:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(255,255,255,0.06);
          transform: translateY(-1px);
          color: #fff;
        }

        .edit-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 1.15rem 1.1rem;
          backdrop-filter: blur(12px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        }

        .edit-error {
          margin-bottom: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,0.35);
          background: rgba(239,68,68,0.08);
          color: #fecaca;
          padding: 0.9rem 1rem;
          font-size: 13px;
        }

        @media (min-width: 640px) {
          .edit-card { padding: 1.35rem 1.4rem; }
        }
      `}</style>

      <div className="edit-root">
        <div className="edit-inner">
          <div className="edit-header">
            <div className="edit-header-left">
              <div className="edit-eyebrow">Admin</div>
              <h1 className="edit-title">
                Edit <span>resource</span>
              </h1>
              <p className="edit-subtitle">Update the fields below and save your changes.</p>
            </div>
            <Link to="/admin/resources" className="edit-back">
              ← Back to resources
            </Link>
          </div>

          {error && <div className="edit-error">{error}</div>}

          <div className="edit-card">
            <ResourceForm
              initialValues={initialValues}
              onSubmit={submit}
              submitText="Save changes"
            />
          </div>
        </div>
      </div>
    </>
  );
}
