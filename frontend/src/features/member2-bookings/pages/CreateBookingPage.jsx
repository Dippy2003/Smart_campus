// Member2 - Bathiya | Booking Management Module B
// CreateBookingPage.jsx — form to create a new booking request

import React, { useEffect, useState } from "react";
import { createBooking, RESOURCES_URL } from "../services/bookingService";

export default function CreateBookingPage() {
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null); // track selected resource object
  const [form, setForm] = useState({
    resourceId: "",
    bookedByEmail: "",
    purpose: "",
    attendees: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load resources from Member 1's endpoint on mount
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When resource changes, update selectedResource object
    if (name === "resourceId") {
      const found = resources.find((r) => r.id === Number(value));
      setSelectedResource(found || null);
    }
  };

  // Check if attendees exceed capacity — returns error message or null
  const getCapacityError = () => {
    if (!selectedResource || !form.attendees) return null;
    if (!selectedResource.capacity) return null;
    const attendees = Number(form.attendees);
    if (attendees > selectedResource.capacity) {
      return `Too many attendees! This resource fits max ${selectedResource.capacity} people.`;
    }
    return null;
  };

  const capacityError = getCapacityError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Frontend validation
    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }
    if (!form.resourceId) {
      setError("Please select a resource.");
      return;
    }

    // Block if over capacity
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
      setForm({
        resourceId: "",
        bookedByEmail: "",
        purpose: "",
        attendees: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
      });
      setSelectedResource(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-xl font-semibold text-white">
        Create a Booking
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Select a resource and choose your time slot.
      </p>

      {message && (
        <div className="mb-4 rounded-xl border border-green-700 bg-green-900/20 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Resource dropdown */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Resource *
          </label>
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            disabled={resourcesLoading}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-60"
          >
            <option value="" className="bg-slate-800">
              {resourcesLoading ? "Loading resources..." : "— Select a resource —"}
            </option>
            {resources.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-800">
                {r.name} ({r.type}) — {r.location}
              </option>
            ))}
          </select>

          {/* Show capacity info when resource is selected */}
          {selectedResource && selectedResource.capacity && (
            <p style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "#6ee7b7",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              ✓ Max capacity: <strong>{selectedResource.capacity} people</strong>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Your Email *
          </label>
          <input
            name="bookedByEmail"
            type="email"
            placeholder="you@example.com"
            value={form.bookedByEmail}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Purpose *
          </label>
          <input
            name="purpose"
            placeholder="e.g. Group study, Lecture, Meeting"
            value={form.purpose}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Attendees — with live capacity warning */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Number of Attendees
          </label>
          <input
            name="attendees"
            type="number"
            min="1"
            max={selectedResource?.capacity || undefined}
            placeholder={
              selectedResource?.capacity
                ? `Max ${selectedResource.capacity}`
                : "e.g. 10"
            }
            value={form.attendees}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2.5 text-white placeholder:text-slate-400 bg-slate-800 focus:ring-2 transition-colors ${
              capacityError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          {/* Live capacity warning */}
          {capacityError && (
            <p style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              ✗ {capacityError}
            </p>
          )}
          {/* Show capacity hint when within limit */}
          {!capacityError && selectedResource?.capacity && form.attendees && (
            <p style={{ marginTop: "5px", fontSize: "12px", color: "#6ee7b7" }}>
              ✓ Within capacity ({form.attendees}/{selectedResource.capacity})
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Booking Date *
          </label>
          <input
            name="bookingDate"
            type="date"
            value={form.bookingDate}
            onChange={handleChange}
            required
            min={today}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Time range */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
            Time Range *
          </label>
          <div className="flex gap-2.5">
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
            <span className="self-center text-slate-400 text-sm">to</span>
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || resourcesLoading || !!capacityError}
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
  );
}
