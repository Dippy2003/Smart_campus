export const HEAD_TECH_EMAIL = "tech@paf.com";

export function isHeadTechnician(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  const role = String(user?.role || "").trim().toUpperCase();
  return role === "TECHNICIAN" && email === HEAD_TECH_EMAIL;
}

export function canManageAllIncidentTickets(user) {
  const role = String(user?.role || "").trim().toUpperCase();
  return role === "ADMIN" || isHeadTechnician(user);
}
