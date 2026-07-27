/**
 * Normalize phone for storage / Google Sheets.
 * Keeps a leading +, strips spaces/dashes/parens, preserves country code digits.
 * Example: "+91 98765 43210" → "+919876543210"
 */
export function normalizePhone(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const hasPlus = s.startsWith("+");
  const digits = s.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus || digits.length > 10 ? `+${digits}` : digits;
}
