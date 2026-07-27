/**
 * Vercel serverless proxy: Early Access form → Google Apps Script → Sheets.
 *
 * Set in Vercel (Production): GOOGLE_APPS_SCRIPT_WAITLIST_URL
 * Do not expose this URL as a REACT_APP_* variable.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v) {
  return String(v == null ? "" : v).trim();
}

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function validate(body) {
  if (!body || typeof body !== "object") {
    return "Invalid request body";
  }

  const fullName = clean(body.full_name || body.fullName);
  const email = clean(body.email).toLowerCase();
  const phoneRaw = clean(body.phone || body.phone_number || body.phoneNumber);
  const linkedin = clean(body.linkedin_url || body.linkedinUrl || body.linkedin);
  const currentRole = clean(body.current_role || body.currentRole);
  const targetRole = clean(body.target_role || body.targetRole);
  const challenge = clean(body.biggest_challenge || body.biggestChallenge);
  const comments = clean(body.comments || body.additional_comments || body.additionalComments);
  const source = clean(body.source || body.utm_source || "direct") || "direct";
  const utmCampaign = clean(body.utm_campaign || body.utmCampaign);

  if (!fullName) return "Please enter your full name";
  if (!email || !EMAIL_RE.test(email)) return "Please enter a valid email address";
  if (!currentRole) return "Please enter your current role";
  if (!targetRole) return "Please select a target role";
  if (!challenge) return "Please select your biggest challenge";
  if (linkedin && !/^https?:\/\//i.test(linkedin)) {
    return "LinkedIn URL must start with http:// or https://";
  }

  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Please enter a valid phone number";
  }
  if (!/^[0-9 +()\-.]+$/.test(phoneRaw)) {
    return "Phone number contains invalid characters";
  }

  const phone =
    (phoneRaw.startsWith("+") || digits.length > 10 ? "+" : "") + digits;

  return {
    full_name: fullName,
    fullName,
    email,
    phone,
    phoneNumber: phone,
    linkedin_url: linkedin,
    linkedinUrl: linkedin,
    current_role: currentRole,
    currentRole,
    target_role: targetRole,
    targetRole,
    biggest_challenge: challenge,
    biggestChallenge: challenge,
    comments,
    additionalComments: comments,
    source: source.slice(0, 120),
    utm_campaign: utmCampaign.slice(0, 200),
    utmCampaign: utmCampaign.slice(0, 200),
    utm_source: clean(body.utm_source).slice(0, 120) || null,
    utm_medium: clean(body.utm_medium).slice(0, 120) || null,
    utm_term: clean(body.utm_term).slice(0, 120) || null,
    utm_content: clean(body.utm_content).slice(0, 120) || null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { detail: "Method not allowed" });
  }

  const appsScriptUrl = clean(process.env.GOOGLE_APPS_SCRIPT_WAITLIST_URL);
  if (!appsScriptUrl) {
    return json(res, 503, {
      detail: "Waitlist service is not configured. Set GOOGLE_APPS_SCRIPT_WAITLIST_URL on Vercel.",
    });
  }

  const validated = validate(req.body);
  if (typeof validated === "string") {
    return json(res, 400, { detail: validated });
  }

  let upstream;
  try {
    upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
      redirect: "follow",
    });
  } catch (err) {
    console.error("waitlist: failed to reach Apps Script", err && err.message);
    return json(res, 502, {
      detail: "Could not reach the waitlist service. Please try again.",
    });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    console.error("waitlist: Apps Script returned non-JSON");
    return json(res, 502, {
      detail: "Waitlist service returned an unexpected response. Please try again.",
    });
  }

  if (!(data && (data.ok || data.success))) {
    const errMsg =
      (data && (data.error || data.message)) || "Could not join the waitlist.";
    const code = (data && data.code) || "";
    if (code === "duplicate" || /already/i.test(String(errMsg))) {
      return json(res, 409, { detail: errMsg });
    }
    return json(res, 400, { detail: errMsg });
  }

  return json(res, 200, {
    ok: true,
    waitlist_id: data.waitlist_id || data.waitlistId || data.id || null,
    message: data.message || "You're on the waitlist.",
  });
};
