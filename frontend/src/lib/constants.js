// NOTE: The OAuth redirect URL (in Login.jsx / AuthCallback.jsx) uses window.location.origin
// and is NEVER hardcoded — that rule is preserved.
// When REACT_APP_BACKEND_URL is unset (Vercel production), API is relative "/api" and the
// waitlist hits api/waitlist/join.js → Google Apps Script → Sheets.
// Local full-stack: set REACT_APP_BACKEND_URL=http://localhost:8000 to use FastAPI.
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// WhatsApp community invite.
export const WHATSAPP_URL = "https://chat.whatsapp.com/K1tS6aHAiTqBdajExEQ6GZ";

export const BRAND = {
  name: "PrepAlign",
  tagline: "AI Career Intelligence Platform",
};
