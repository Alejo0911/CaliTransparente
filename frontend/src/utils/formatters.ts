/**
 * Utilidades para formateo de moneda colombiana (COP), fechas y URLs de SECOP II.
 */

export function formatCOP(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "$0 COP";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCOPCompact(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "$0";
  }
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)} Billones COP`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)} Mil Millones COP`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)} Millones COP`;
  }
  return formatCOP(value);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "No registrada";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function extraerUrlProceso(urlproceso?: any): string {
  if (!urlproceso) return "";
  if (typeof urlproceso === "string") return urlproceso;
  if (typeof urlproceso === "object" && urlproceso.url) return urlproceso.url;
  return "";
}

