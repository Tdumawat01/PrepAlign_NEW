// Captures UTM params from URL. Safe to call on every form submit.
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  return out;
}
