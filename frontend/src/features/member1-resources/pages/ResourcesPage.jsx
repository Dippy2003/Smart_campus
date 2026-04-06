import { useEffect, useMemo, useState } from "react";
import ResourceTable from "../components/ResourceTable";
import ResourceCard from "../components/ResourceCard";
import { getAllResources } from "../services/resourceApi";

const TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["", "ACTIVE", "OUT_OF_SERVICE"];
const SORTS = [
  { key: "name-asc", label: "Name (A–Z)" },
  { key: "name-desc", label: "Name (Z–A)" },
  { key: "capacity-desc", label: "Capacity (high → low)" },
  { key: "capacity-asc", label: "Capacity (low → high)" },
  { key: "status-asc", label: "Status" }
];

const inputClass =
  "h-9 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-white outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [view, setView] = useState("table"); // table | cards
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
      case "name-desc":
        list.sort((a, b) => byText(b.name, a.name));
        break;
      case "capacity-desc":
        list.sort((a, b) => (Number(b.capacity) || 0) - (Number(a.capacity) || 0));
        break;
      case "capacity-asc":
        list.sort((a, b) => (Number(a.capacity) || 0) - (Number(b.capacity) || 0));
        break;
      case "status-asc":
        list.sort((a, b) => byText(a.status, b.status) || byText(a.name, b.name));
        break;
      case "name-asc":
      default:
        list.sort((a, b) => byText(a.name, b.name));
        break;
    }

    return list;
  }, [filteredResources, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Resources
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Search and filter across all available resources.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Total resources
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Out of service
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">{stats.out}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-lg sm:grid-cols-[2.4fr,1fr]">
        <div className="space-y-2.5">
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Keyword
            <input
              placeholder="Search by name or location…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Type
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                {TYPES.map((t) => (
                  <option key={t || "none"} value={t}>
                    {t ? t : "Any type"}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s || "none"} value={s}>
                    {s ? s : "Any status"}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Location
              <input
                placeholder="Filter by location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Sort
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className={inputClass}
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              View
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={
                    "inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                    (view === "table"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-600 text-slate-300 hover:bg-slate-700")
                  }
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setView("cards")}
                  className={
                    "inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                    (view === "cards"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-600 text-slate-300 hover:bg-slate-700")
                  }
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="text-xs text-slate-400">
            <p className="font-medium text-white">Filters</p>
            <p className="mt-0.5">
              Keyword searches name & location. Type, status, and location filters apply together.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clear}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-slate-400">Fetching resources…</p>}

      {error && (
        <div className="rounded-2xl border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedResources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
          {sortedResources.length === 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-400 sm:col-span-2 lg:col-span-3">
              No resources found. Try adjusting your filters.
            </div>
          )}
        </div>
      ) : (
        <ResourceTable resources={sortedResources} showAdminActions={false} />
      )}
    </div>
  );
}
