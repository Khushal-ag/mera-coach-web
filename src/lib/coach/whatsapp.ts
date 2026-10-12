/** profile-by-id sometimes returns mobiles as scientific notation (e.g. "9.8874e+009"). */
export function normalizeCoachMobile(mobile?: string | number | null): string {
  if (mobile == null) return "";
  const raw = String(mobile).trim();
  if (!raw) return "";
  if (/e[+-]?\d+/i.test(raw)) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      return Math.round(n).toString();
    }
  }
  return raw.replace(/\D/g, "");
}

/** wa.me URL from Indian mobile (matches app `whatsAppUrlFromMobile`). */
export function whatsAppUrlFromMobile(mobile?: string | null): string | null {
  const digits = normalizeCoachMobile(mobile).replace(/^0+/, "");
  if (!digits) return null;
  if (digits.length === 10) return `https://wa.me/91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) {
    return `https://wa.me/${digits}`;
  }
  return null;
}
