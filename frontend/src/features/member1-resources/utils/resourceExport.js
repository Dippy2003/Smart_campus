/** Escape a single CSV field (RFC-style quoting). */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Download the given resources as a UTF-8 CSV (with BOM for Excel).
 * @param {Array<object>} resources - items with id, name, type, capacity, location, availabilityStart, availabilityEnd, status
 * @param {string} [filename] - default resources-export.csv
 */
export function exportResourcesToCsv(resources, filename = "resources-export.csv") {
  const headers = [
    "ID",
    "Name",
    "Type",
    "Capacity",
    "Location",
    "Availability Start",
    "Availability End",
    "Status",
  ];
  const rows = resources.map((r) => [
    r.id,
    r.name,
    r.type,
    r.capacity,
    r.location,
    r.availabilityStart,
    r.availabilityEnd,
    r.status,
  ]);
  const body = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const csv = "\uFEFF" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
