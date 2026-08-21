export function initials(first, last) {
  return `${(first || "?")[0] || ""}${(last || "")[0] || ""}`.toUpperCase();
}

export function fullName(s) {
  return `${s.first_name} ${s.last_name}`;
}

export function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}
