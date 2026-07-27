/**
 * Waitlist submission API.
 *
 * Today: posts to PrepAlign backend → Google Apps Script → Sheets.
 * Later: swap the body of `submitWaitlist` for Supabase (or another provider)
 * without changing the Home form UI.
 */
import axios from "axios";
import { API } from "../lib/constants";
import { getAttribution } from "../lib/utm";
import { normalizePhone } from "../lib/phone";

/**
 * @typedef {Object} WaitlistFormInput
 * @property {string} full_name
 * @property {string} email
 * @property {string} phone
 * @property {string} [linkedin_url]
 * @property {string} current_role
 * @property {string} target_role
 * @property {string} biggest_challenge
 * @property {string} [comments]
 */

/**
 * Client-side validation. Returns an error message or null.
 * @param {WaitlistFormInput} form
 * @returns {string|null}
 */
export function validateWaitlistForm(form) {
  const required = [
    ["full_name", "Please enter your full name"],
    ["email", "Please enter your email"],
    ["phone", "Please enter your phone number"],
    ["current_role", "Please enter your current role"],
    ["target_role", "Please select a target role"],
    ["biggest_challenge", "Please select your biggest challenge"],
  ];
  for (const [key, msg] of required) {
    if (!String(form[key] || "").trim()) return msg;
  }

  const email = form.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address";
  }

  const phoneNormalized = normalizePhone(form.phone);
  const phoneDigits = phoneNormalized.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return "Please enter a valid phone number";
  }

  const linkedin = (form.linkedin_url || "").trim();
  if (linkedin && !/^https?:\/\//i.test(linkedin)) {
    return "LinkedIn URL must start with http:// or https://";
  }

  return null;
}

/**
 * Build the provider-agnostic payload.
 * @param {WaitlistFormInput} form
 */
export function buildWaitlistPayload(form) {
  const attribution = getAttribution();
  const phone = normalizePhone(form.phone);
  return {
    full_name: form.full_name.trim(),
    email: form.email.trim().toLowerCase(),
    phone,
    linkedin_url: (form.linkedin_url || "").trim() || null,
    current_role: form.current_role.trim(),
    target_role: form.target_role.trim(),
    biggest_challenge: form.biggest_challenge.trim(),
    comments: (form.comments || "").trim() || null,
    source: attribution.source,
    utm_campaign: attribution.utm_campaign || null,
    utm_source: attribution.utm_source || null,
    utm_medium: attribution.utm_medium || null,
    utm_term: attribution.utm_term || null,
    utm_content: attribution.utm_content || null,
  };
}

/**
 * Submit waitlist application.
 * @param {WaitlistFormInput} form
 * @returns {Promise<{ ok: boolean, waitlist_id?: string, message?: string }>}
 */
export async function submitWaitlist(form) {
  const validationError = validateWaitlistForm(form);
  if (validationError) {
    const err = new Error(validationError);
    err.code = "validation";
    throw err;
  }

  const payload = buildWaitlistPayload(form);

  // Provider: /api/waitlist/join → Google Apps Script → Sheets
  // Prod (Vercel): api/waitlist/join.js with GOOGLE_APPS_SCRIPT_WAITLIST_URL
  // Local FastAPI: set REACT_APP_BACKEND_URL so API points at the backend
  const { data } = await axios.post(`${API}/waitlist/join`, payload, {
    timeout: 45000,
  });
  return data;
}

/**
 * Map API / network errors to a friendly toast message.
 * @param {unknown} err
 * @returns {string}
 */
export function getWaitlistErrorMessage(err) {
  if (!err) return "Something went wrong. Please try again.";
  if (err.code === "validation" && err.message) return err.message;

  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;

  const apiMsg = err?.response?.data?.error || err?.response?.data?.message;
  if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

  if (err?.response?.status === 409) {
    return "This email is already on the waitlist.";
  }
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }
  if (!err?.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
