import { useState } from "react";

const TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const normTime = (v) => (v ? String(v).slice(0, 8) : "09:00:00"); // HH:mm:ss

const fieldClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

export default function ResourceForm({ initialValues, onSubmit, submitText }) {
  const [form, setForm] = useState(
    initialValues
      ? {
          ...initialValues,
          availabilityStart: normTime(initialValues.availabilityStart) || "09:00:00",
          availabilityEnd: normTime(initialValues.availabilityEnd) || "17:00:00"
        }
      : {
          name: "",
          type: "LAB",
          capacity: 1,
          location: "",
          availabilityStart: "09:00:00",
          availabilityEnd: "17:00:00",
          status: "ACTIVE"
        }
  );

  const change = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toTime = (v) => (v && v.length === 5 ? `${v}:00` : v || "09:00:00");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      availabilityStart: toTime(form.availabilityStart),
      availabilityEnd: toTime(form.availabilityEnd)
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid max-w-xl gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2">

        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Namess
        </label>

        <input
          placeholder="Enter resource name"
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
          required
          className={fieldClass}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-600">Type</label>
          <select
            value={form.type}
            onChange={(e) => change("type", e.target.value)}
            className={fieldClass}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Capacity
          </label>
          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => change("capacity", e.target.value)}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
          Location
        </label>
        <input
          placeholder="Building / floor / room"
          value={form.location}
          onChange={(e) => change("location", e.target.value)}
          required
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Availability start
          </label>
          <input
            type="time"
            step="1"
            value={form.availabilityStart}
            onChange={(e) => change("availabilityStart", e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Availability end
          </label>
          <input
            type="time"
            step="1"
            value={form.availabilityEnd}
            onChange={(e) => change("availabilityEnd", e.target.value)}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-600">Status</label>
        <select
          value={form.status}
          onChange={(e) => change("status", e.target.value)}
          className={fieldClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {submitText || "Save resource"}
        </button>
      </div>
    </form>
  );
}
