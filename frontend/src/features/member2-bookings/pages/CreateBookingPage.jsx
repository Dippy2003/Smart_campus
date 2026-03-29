import React, { useEffect, useState } from "react";
import { createBooking, RESOURCES_URL } from "../services/bookingService";

export default function CreateBookingPage() {
  const [resources, setResources] = useState([]);
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

  useEffect(() => {
    fetch(RESOURCES_URL)
      .then(r => r.json())
      .then(setResources)
      .catch(() => setError("Could not load resources. Is the backend running?"));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
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
      setMessage("✓ Booking submitted successfully! Status: PENDING");
      setForm({
        resourceId: "",
        bookedByEmail: "",
        purpose: "",
        attendees: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 6, fontSize: "20px", fontWeight: 600 }}>
        Create a Booking
      </h2>
      <p style={{ marginBottom: 24, color: "#6b7280", fontSize: "14px" }}>
        Select a resource and choose your time slot.
      </p>

      {message && (
        <div style={alertStyle("green")}>{message}</div>
      )}
      {error && (
        <div style={alertStyle("red")}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Resource *</label>
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">— Select a resource —</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.type}) — {r.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Your Email *</label>
          <input
            name="bookedByEmail"
            type="email"
            placeholder="you@example.com"
            value={form.bookedByEmail}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Purpose *</label>
          <input
            name="purpose"
            placeholder="e.g. Group study, Lecture, Meeting"
            value={form.purpose}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Number of Attendees</label>
          <input
            name="attendees"
            type="number"
            min="1"
            placeholder="e.g. 10"
            value={form.attendees}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Booking Date *</label>
          <input
            name="bookingDate"
            type="date"
            value={form.bookingDate}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Time Range *</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
            <span style={{ alignSelf: "center", color: "#6b7280" }}>to</span>
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "12px",
            borderRadius: "8px",
            background: loading ? "#93c5fd" : "#2563eb",
            color: "#fff",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "5px",
  color: "#374151",
};

const alertStyle = (color) => ({
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "16px",
  background: color === "green" ? "#ecfdf5" : "#fef2f2",
  color: color === "green" ? "#065f46" : "#991b1b",
  border: `1px solid ${color === "green" ? "#6ee7b7" : "#fca5a5"}`,
  fontSize: "14px",
});