// Captures UTM + referral source for waitlist attribution. Safe on every submit.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return out;
}

/**
 * Referral / traffic source for the Sheet "Source" column.
 * Priority: ?source= → ?ref= → utm_source → document.referrer host → "direct"
 */
export function getReferralSource() {
  if (typeof window === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get("source") || params.get("ref");
  if (explicit) return explicit.slice(0, 120);

  const utm = getUtmParams();
  if (utm.utm_source) return utm.utm_source.slice(0, 120);

  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host) return host.slice(0, 120);
    }
  } catch {
    /* ignore bad referrer */
  }
  return "direct";
}

export function getAttribution() {
  const utm = getUtmParams();
  return {
    ...utm,
    source: getReferralSource(),
    utm_campaign: utm.utm_campaign || "",
  };
}
