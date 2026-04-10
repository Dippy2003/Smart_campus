import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookingsForCalendar } from "../services/bookingService";
import BookingStatusBadge from "../components/BookingStatusBadge";
import { useToast } from "../../../shared/components/ToastProvider";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  CANCELLED: "#6b7280",
};

function buildMonthGrid(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ date: d, inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, month, day);
    cells.push({ date: d, inCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (firstDay + daysInMonth) + 1;
    const d = new Date(year, month + 1, nextDay);
    cells.push({ date: d, inCurrentMonth: false });
  }

  return cells;
}

function toDateKey(dateLike) {
  if (!dateLike) return "";
  if (typeof dateLike === "string") return dateLike;
  const d = new Date(dateLike);
  return d.toISOString().slice(0, 10);
}

function formatMonthLabel(monthDate) {
  return monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function BookingCalendarPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBookingsForCalendar();
        if (mounted) setAllBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message || "Failed to load calendar bookings.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") return allBookings;
    return allBookings.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

  const bookingsByDate = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      const key = toDateKey(booking.bookingDate);
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    }, {});
  }, [filteredBookings]);

  const monthCells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const selectedDayBookings = useMemo(() => {
    return bookingsByDate[selectedDateKey] || [];
  }, [bookingsByDate, selectedDateKey]);

  const monthStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    let total = 0;
    const daySet = new Set();

    Object.entries(bookingsByDate).forEach(([dateKey, list]) => {
      const d = new Date(dateKey);
      if (d.getFullYear() === year && d.getMonth() === month) {
        total += list.length;
        daySet.add(dateKey);
      }
    });
    return { total, bookedDays: daySet.size };
  }, [bookingsByDate, currentMonth]);

  const goPrevMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(toDateKey(now));
  };

  const openCreateBooking = (dateKey, resourceId) => {
    if (!dateKey) return;
    if (dateKey < todayKey) {
      toast.error("You cannot book a date before today.");
      return;
    }
    const params = new URLSearchParams({ date: dateKey });
    if (resourceId) params.set("resourceId", String(resourceId));
    navigate(`/bookings/create?${params.toString()}`);
  };

  const todayKey = toDateKey(new Date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .cal-root {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: calc(100vh - 76px);
          color: #e2e8f0;
          padding: 20px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cal-container {
          width: 100%;
          max-width: 1320px;
        }

        /* ── Header ── */
        .cal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 18px;
        }
        .cal-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #e2e8f0 30%, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .cal-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
          font-weight: 400;
        }

        /* ── Nav buttons ── */
        .cal-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-nav {
          background: #13131f;
          border: 1px solid #1e1e30;
          color: #94a3b8;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-nav:hover {
          background: #1a1a2e;
          border-color: #6366f1;
          color: #e2e8f0;
        }
        .btn-today {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
        }
        .btn-today:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Stats bar ── */
        .cal-statsbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0;
          background: #0f0f1a;
          border: 1px solid #1e1e30;
          border-radius: 14px;
          padding: 0;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .stat-pill {
          flex: 1;
          min-width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 14px 20px;
          border-right: 1px solid #1e1e30;
          gap: 2px;
        }
        .stat-pill:last-child { border-right: none; }
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          color: #818cf8;
          line-height: 1;
        }
        .stat-label {
          font-size: 11px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }
        .stat-month {
          flex: 2;
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          border-right: 1px solid #1e1e30;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          min-width: 180px;
        }
        .stat-filter {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          min-width: 180px;
        }
        .stat-filter label {
          font-size: 12px;
          color: #475569;
          white-space: nowrap;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-select {
          background: #0a0a0f;
          border: 1px solid #1e1e30;
          color: #94a3b8;
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .filter-select:focus { border-color: #6366f1; color: #e2e8f0; }

        /* ── Main grid ── */
        .cal-body {
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .cal-body { grid-template-columns: 1fr; }
        }

        /* ── Calendar grid ── */
        .calendar-wrap {
          background: #0f0f1a;
          border: 1px solid #1e1e30;
          border-radius: 16px;
          overflow: hidden;
        }
        .day-names-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #0a0a0f;
          border-bottom: 1px solid #1e1e30;
        }
        .day-name {
          padding: 10px 4px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cells-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .cell {
          min-height: 88px;
          border-right: 1px solid #1a1a2a;
          border-bottom: 1px solid #1a1a2a;
          padding: 6px;
          text-align: left;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          font-family: inherit;
        }
        .cell:nth-child(7n) { border-right: none; }
        .cell:hover { background: #141428; }
        .cell.selected {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.25);
        }
        .cell.selected::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px solid rgba(99,102,241,0.5);
          border-radius: 2px;
          pointer-events: none;
        }
        .cell.today .cell-num {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          box-shadow: 0 0 12px rgba(99,102,241,0.5);
        }
        .cell-num {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 5px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
        }
        .cell.in-month .cell-num { color: #e2e8f0; }
        .cell.out-month { opacity: 0.3; }

        .cell-dot-row {
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
          margin-top: 3px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .cell-count {
          font-size: 10px;
          font-weight: 600;
          color: #6366f1;
          margin-top: 4px;
          font-family: 'DM Mono', monospace;
        }
        .cell-preview {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* ── Side panel ── */
        .side-panel {
          background: #0f0f1a;
          border: 1px solid #1e1e30;
          border-radius: 16px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }
        .side-header {
          padding: 16px 18px;
          border-bottom: 1px solid #1e1e30;
          background: #0a0a0f;
        }
        .side-date {
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: #6366f1;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }
        .side-title {
          font-size: 16px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
        }
        .side-body {
          padding: 14px;
          max-height: 500px;
          overflow-y: auto;
        }
        .side-body::-webkit-scrollbar { width: 4px; }
        .side-body::-webkit-scrollbar-track { background: transparent; }
        .side-body::-webkit-scrollbar-thumb { background: #1e1e30; border-radius: 4px; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #334155;
          font-size: 13px;
        }
        .empty-icon {
          font-size: 36px;
          margin-bottom: 10px;
          opacity: 0.4;
        }

        .booking-card {
          border: 1px solid #1e1e30;
          background: #0a0a0f;
          border-radius: 12px;
          padding: 11px 12px;
          margin-bottom: 10px;
          transition: border-color 0.15s, transform 0.1s;
        }
        .booking-card:last-child { margin-bottom: 0; }
        .booking-card:hover {
          border-color: #2d2d4a;
          transform: translateX(2px);
        }
        .booking-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }
        .booking-resource {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .booking-time {
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: #6366f1;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .booking-meta {
          font-size: 11px;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .booking-purpose {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
          font-style: italic;
        }
        .book-day-btn {
          width: 100%;
          margin-top: 10px;
          border: 1px solid rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.15);
          color: #c7d2fe;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .book-day-btn:hover {
          background: rgba(99,102,241,0.22);
          border-color: rgba(129,140,248,0.7);
        }
        .book-resource-btn {
          margin-top: 8px;
          border: 1px solid #1f2937;
          background: #111827;
          color: #93c5fd;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .book-resource-btn:hover {
          border-color: #3b82f6;
          color: #bfdbfe;
        }

        /* ── Loading ── */
        .loading-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 40px 0;
          color: #475569;
          font-size: 13px;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #1e1e30;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .cal-root { padding: 14px 10px; }
          .cell { min-height: 72px; padding: 6px; }
          .cell-preview { display: none; }
        }
      `}</style>

      <div className="cal-root">
        <div className="cal-container">
        {/* Header */}
        <div className="cal-header">
          <div>
            <h2 className="cal-title">Booking Calendar</h2>
            <p className="cal-subtitle">Monthly view of booking activity · identify busy days at a glance</p>
          </div>
          <div className="cal-nav">
            <button onClick={goPrevMonth} className="btn-nav">← Prev</button>
            <button onClick={goToday} className="btn-today">Today</button>
            <button onClick={goNextMonth} className="btn-nav">Next →</button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="cal-statsbar">
          <div className="stat-month">{formatMonthLabel(currentMonth)}</div>
          <div className="stat-pill">
            <span className="stat-value">{monthStats.total}</span>
            <span className="stat-label">Bookings</span>
          </div>
          <div className="stat-pill">
            <span className="stat-value">{monthStats.bookedDays}</span>
            <span className="stat-label">Busy Days</span>
          </div>
          <div className="stat-filter">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            Loading calendar data…
          </div>
        ) : (
          <div className="cal-body">
            {/* Calendar */}
            <div className="calendar-wrap">
              <div className="day-names-row">
                {DAY_NAMES.map((name) => (
                  <div key={name} className="day-name">{name}</div>
                ))}
              </div>
              <div className="cells-grid">
                {monthCells.map((cell) => {
                  const dateKey = toDateKey(cell.date);
                  const dayBookings = bookingsByDate[dateKey] || [];
                  const selected = dateKey === selectedDateKey;
                  const isToday = dateKey === todayKey;

                  // Gather status dots (up to 5 unique)
                  const dotStatuses = dayBookings.slice(0, 5).map((b) => b.status);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDateKey(dateKey)}
                      className={[
                        "cell",
                        cell.inCurrentMonth ? "in-month" : "out-month",
                        selected ? "selected" : "",
                        isToday ? "today" : "",
                      ].join(" ")}
                      type="button"
                    >
                      <div className="cell-num">{cell.date.getDate()}</div>
                      {dayBookings.length > 0 && (
                        <>
                          <div className="cell-dot-row">
                            {dotStatuses.map((st, i) => (
                              <span
                                key={i}
                                className="status-dot"
                                style={{ background: STATUS_COLORS[st] || "#6366f1" }}
                              />
                            ))}
                          </div>
                          <div className="cell-count">{dayBookings.length} booking{dayBookings.length > 1 ? "s" : ""}</div>
                          {dayBookings[0] && (
                            <div className="cell-preview">
                              {dayBookings[0].startTime} · {dayBookings[0].resource?.name || "Resource"}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side panel */}
            <div className="side-panel">
              <div className="side-header">
                <div className="side-date">{selectedDateKey || "—"}</div>
                <h3 className="side-title">
                  {selectedDayBookings.length > 0
                    ? `${selectedDayBookings.length} Booking${selectedDayBookings.length > 1 ? "s" : ""}`
                    : "No Bookings"}
                </h3>
              </div>
              <div className="side-body">
                {selectedDayBookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <span>No bookings for this date</span>
                    <button
                      type="button"
                      className="book-day-btn"
                      onClick={() => openCreateBooking(selectedDateKey)}
                    >
                      Book This Day
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="book-day-btn"
                      onClick={() => openCreateBooking(selectedDateKey)}
                    >
                      Book Selected Day
                    </button>
                    {selectedDayBookings.map((b) => (
                      <div key={b.id} className="booking-card">
                        <div className="booking-card-top">
                          <span className="booking-resource">{b.resource?.name || "Resource"}</span>
                          <BookingStatusBadge status={b.status} />
                        </div>
                        <div className="booking-time">{b.startTime} — {b.endTime}</div>
                        <div className="booking-meta">{b.bookedByEmail}</div>
                        {b.purpose && <div className="booking-purpose">{b.purpose}</div>}
                        <button
                          type="button"
                          className="book-resource-btn"
                          onClick={() => openCreateBooking(selectedDateKey, b.resource?.id)}
                        >
                          Book This Resource
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}