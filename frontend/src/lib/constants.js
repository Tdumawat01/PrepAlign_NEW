// NOTE: The OAuth redirect URL (in Login.jsx / AuthCallback.jsx) uses window.location.origin
// and is NEVER hardcoded — that rule is preserved.
// For general API calls, REACT_APP_BACKEND_URL is optional: when unset (e.g. frontend-only
// Vercel deploy), API becomes the relative "/api" path and requests fail cleanly, caught
// by existing try/catch handlers (no crashes).
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// WhatsApp community invite.
export const WHATSAPP_URL = "https://chat.whatsapp.com/K1tS6aHAiTqBdajExEQ6GZ";

export const BRAND = {
  name: "PrepAlign",
  tagline: "AI Career Intelligence Platform",
};
