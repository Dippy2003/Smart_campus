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
                {r.status === "OUT_OF_SERVICE" ? " ⚠ OUT OF SERVICE" : ""}
              </option>
            ))}
          </select>

          {/* OUT_OF_SERVICE warning */}
          {isOutOfService && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#fca5a5", display: "flex", alignItems: "center", gap: "4px" }}>
              ✗ This resource is currently out of service and cannot be booked.
            </p>
          )}

          {/* Availability window info */}
          {selectedResource && !isOutOfService && selectedResource.availabilityStart && selectedResource.availabilityEnd && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#6ee7b7", display: "flex", alignItems: "center", gap: "4px" }}>
              ✓ Available: {selectedResource.availabilityStart.substring(0, 5)} – {selectedResource.availabilityEnd.substring(0, 5)}
              &nbsp;·&nbsp; Max {selectedResource.capacity} people
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
            value={form.bookedByEmail}
            readOnly
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

        {/* Attendees */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">
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
            className={`w-full rounded-lg border px-3 py-2.5 text-white placeholder:text-slate-400 bg-slate-800 focus:ring-2 transition-colors ${
              capacityError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          {capacityError && (
            <p style={{ marginTop: "5px", fontSize: "12px", color: "#fca5a5" }}>✗ {capacityError}</p>
          )}
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
              className={`flex-1 rounded-lg border px-3 py-2.5 text-white bg-slate-800 focus:ring-2 transition-colors ${
                availabilityError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            <span className="self-center text-slate-400 text-sm">to</span>
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              className={`flex-1 rounded-lg border px-3 py-2.5 text-white bg-slate-800 focus:ring-2 transition-colors ${
                availabilityError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
          </div>
          {/* Availability window error */}
          {availabilityError && (
            <p style={{ marginTop: "5px", fontSize: "12px", color: "#fca5a5" }}>✗ {availabilityError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || resourcesLoading || hasBlockingError}
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
  );
}
