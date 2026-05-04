// NOTE: The OAuth redirect URL (in Login.jsx / AuthCallback.jsx) uses window.location.origin
// and is NEVER hardcoded — that rule is preserved.
// For general API calls, REACT_APP_BACKEND_URL is optional: when unset (e.g. frontend-only
// Vercel deploy), API becomes the relative "/api" path and requests fail cleanly, caught
// by existing try/catch handlers (no crashes).
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// Placeholder WhatsApp community invite — replace with real invite URL before launch.
export const WHATSAPP_URL = "https://chat.whatsapp.com/XXXXXXXXXXXXXXXXX";

export const BRAND = {
  name: "PrepAlign",
  tagline: "Break into AI & Startup Roles — Without Coding",
};
