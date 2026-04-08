// Member2 - Bathiya | Booking Management Module B
// CreateBookingPage.jsx — form to create a new booking request

import React, { useEffect, useState } from "react";
import { createBooking, RESOURCES_URL } from "../services/bookingService";
import { useToast } from "../../../shared/components/ToastProvider";
import { useAuth } from "../../member4-auth/Contexts/AuthContext";

export default function CreateBookingPage() {
  const toast = useToast();
  const { user } = useAuth();
  const sessionEmail = user?.email ?? "";
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [form, setForm] = useState({
    resourceId: "",
    bookedByEmail: sessionEmail,
    purpose: "",
    attendees: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResourcesLoading(true);
    fetch(RESOURCES_URL)
      .then((r) => r.json())
      .then((data) => {
        setResources(data);
        setResourcesLoading(false);
      })
      .catch(() => {
        setError("Could not load resources. Is the backend running?");
        setResourcesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;
    setForm((prev) => ({ ...prev, bookedByEmail: sessionEmail }));
  }, [sessionEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "resourceId") {
      const found = resources.find((r) => r.id === Number(value));
      setSelectedResource(found || null);
    }
  };

  // Check if resource is OUT_OF_SERVICE
  const isOutOfService = selectedResource?.status === "OUT_OF_SERVICE";

  // Check if attendees exceed capacity
  const getCapacityError = () => {
    if (!selectedResource || !form.attendees) return null;
    if (!selectedResource.capacity) return null;
    const attendees = Number(form.attendees);
    if (attendees > selectedResource.capacity) {
      return `Too many attendees! This resource fits max ${selectedResource.capacity} people.`;
    }
    return null;
  };

  // Check if booking time is within resource availability window
  const getAvailabilityError = () => {
    if (!selectedResource) return null;
    if (!selectedResource.availabilityStart || !selectedResource.availabilityEnd) return null;
    if (!form.startTime || !form.endTime) return null;

    const bookingStart = form.startTime;
    const bookingEnd = form.endTime;
    const availStart = selectedResource.availabilityStart.substring(0, 5); // HH:MM
    const availEnd = selectedResource.availabilityEnd.substring(0, 5);     // HH:MM

    if (bookingStart < availStart || bookingEnd > availEnd) {
      return `Booking time must be within availability hours: ${availStart} – ${availEnd}.`;
    }
    return null;
  };

  const capacityError = getCapacityError();
  const availabilityError = getAvailabilityError();

  // Submit is blocked if any error exists
  const hasBlockingError = isOutOfService || !!capacityError || !!availabilityError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }
    if (!form.resourceId) {
      setError("Please select a resource.");
      return;
    }
    if (isOutOfService) {
      setError("This resource is currently out of service.");
      return;
    }
    if (availabilityError) {
      setError(availabilityError);
      return;
    }
    if (capacityError) {
      setError(capacityError);
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        resource: { id: Number(form.resourceId) },
        bookedByEmail: form.bookedByEmail,
        purpose: form.purpose,
        attendees: form.attendees ? Number(form.attendees) : null,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setMessage("✓ Booking submitted successfully! Status: PENDING — waiting for admin approval.");
      toast.success("Booking request submitted (PENDING).");
      setForm({
        resourceId: "",
        bookedByEmail: sessionEmail,
        purpose: "",
        attendees: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
      });
      setSelectedResource(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Booking submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .cb-root {
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          min-height: auto;
          padding: 0 1.5rem 2rem;
          position: relative;
          overflow-x: hidden;
        }
        .cb-inner {
          position: relative;
          z-index: 1;
          max-width: 980px;
          margin: 0 auto;
          animation: cb-fade-in 0.5s ease both;
        }
        @keyframes cb-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-header {
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .cb-header-left { display: flex; flex-direction: column; gap: 0.3rem; }
        .cb-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cb-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 2px;
          background: #6366f1;
          border-radius: 999px;
        }
        .cb-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .cb-title span {
          background: linear-gradient(90deg, #818cf8, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cb-subtitle {
          margin: 0.35rem 0 0;
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }
        .cb-card {
          background: rgba(15,23,42,0.55);
          border: 1px solid rgba(148,163,184,0.20);
          border-radius: 16px;
          padding: 1.25rem 1.25rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
          max-width: 860px;
        }
        .cb-message {
          margin-bottom: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(34,197,94,0.35);
          background: rgba(34,197,94,0.08);
          color: #bbf7d0;
          padding: 0.9rem 1rem;
          font-size: 13px;
        }
        .cb-error {
          margin-bottom: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,0.35);
          background: rgba(239,68,68,0.08);
          color: #fecaca;
          padding: 0.9rem 1rem;
          font-size: 13px;
        }
        .cb-label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #cbd5e1;
        }
        .cb-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #475569;
          background: rgba(30,41,59,0.82);
          padding: 0.625rem 0.75rem;
          color: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cb-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }
        .cb-input:disabled { opacity: 0.6; }
        .cb-input--error {
          border-color: #ef4444;
        }
        .cb-input--error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.2);
        }
        .cb-helper {
          margin-top: 5px;
          font-size: 12px;
        }
        .cb-helper--error { color: #fca5a5; }
        .cb-helper--ok { color: #6ee7b7; }
        .cb-submit {
          margin-top: 0.5rem;
          width: 100%;
          border-radius: 0.5rem;
          border: none;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          cursor: pointer;
        }
        .cb-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
          background: linear-gradient(135deg, #818cf8, #6366f1);
        }
        .cb-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .cb-time-wrap {
          display: flex;
          gap: 0.625rem;
        }
        .cb-time-sep {
          align-self: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        @media (min-width: 640px) {
          .cb-card { padding: 1.35rem 1.4rem; }
        }
      `}</style>

      <div className="cb-root">
        <div className="cb-inner">
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-eyebrow">Bookings</div>
              <h1 className="cb-title">
                Create <span>booking</span>
              </h1>
              <p className="cb-subtitle">
                Select a resource and choose your preferred time slot.
              </p>
            </div>
          </div>

          <div className="cb-card">
            {message && <div className="cb-message">{message}</div>}
            {error && <div className="cb-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

        {/* Resource dropdown */}
        <div>
          <label className="cb-label">
            Resource *
          </label>
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            disabled={resourcesLoading}
            className="cb-input"
          >
            <option value="" className="bg-slate-800">
              {resourcesLoading ? "Loading resources..." : "— Select a resource —"}
            </option>
            {resources.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-800">
                {r.name} ({r.type}) — {r.location}
                {r.status === "OUT_OF_SERVICE" ? " ⚠ OUT OF SERVICE" : ""}
              </option>
            ))}
          </select>

          {/* OUT_OF_SERVICE warning */}
          {isOutOfService && (
            <p className="cb-helper cb-helper--error" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              ✗ This resource is currently out of service and cannot be booked.
            </p>
          )}

          {/* Availability window info */}
          {selectedResource && !isOutOfService && selectedResource.availabilityStart && selectedResource.availabilityEnd && (
            <p className="cb-helper cb-helper--ok" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              ✓ Available: {selectedResource.availabilityStart.substring(0, 5)} – {selectedResource.availabilityEnd.substring(0, 5)}
              &nbsp;·&nbsp; Max {selectedResource.capacity} people
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="cb-label">
            Your Email *
          </label>
          <input
            name="bookedByEmail"
            type="email"
            value={form.bookedByEmail}
            readOnly
            required
            className="cb-input"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="cb-label">
            Purpose *
          </label>
          <input
            name="purpose"
            placeholder="e.g. Group study, Lecture, Meeting"
            value={form.purpose}
            onChange={handleChange}
            required
            className="cb-input"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="cb-label">
            Number of Attendees
          </label>
          <input
            name="attendees"
            type="number"
            min="1"
            max={selectedResource?.capacity || undefined}
            placeholder={selectedResource?.capacity ? `Max ${selectedResource.capacity}` : "e.g. 10"}
            value={form.attendees}
            onChange={handleChange}
            className={`cb-input ${capacityError ? "cb-input--error" : ""}`}
          />
          {capacityError && (
            <p className="cb-helper cb-helper--error">✗ {capacityError}</p>
          )}
          {!capacityError && selectedResource?.capacity && form.attendees && (
            <p className="cb-helper cb-helper--ok">
              ✓ Within capacity ({form.attendees}/{selectedResource.capacity})
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="cb-label">
            Booking Date *
          </label>
          <input
            name="bookingDate"
            type="date"
            value={form.bookingDate}
            onChange={handleChange}
            required
            min={today}
            className="cb-input"
          />
        </div>

        {/* Time range */}
        <div>
          <label className="cb-label">
            Time Range *
          </label>
          <div className="cb-time-wrap">
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
              className={`cb-input ${availabilityError ? "cb-input--error" : ""}`}
            />
            <span className="cb-time-sep">to</span>
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              className={`cb-input ${availabilityError ? "cb-input--error" : ""}`}
            />
          </div>
          {/* Availability window error */}
          {availabilityError && (
            <p className="cb-helper cb-helper--error">✗ {availabilityError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || resourcesLoading || hasBlockingError}
          className="cb-submit"
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
