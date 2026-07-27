/**
 * PrepAlign Early Access Waitlist → Google Sheets
 *
 * SETUP
 * 1. Open your Google Sheet (columns A–M as documented below).
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL into backend/.env:
 *    GOOGLE_APPS_SCRIPT_WAITLIST_URL=https://script.google.com/macros/s/.../exec
 * 5. Redeploy after any script edits (New version).
 *
 * Sheet columns (row 1 headers, data from row 2):
 * A Waitlist ID | B Timestamp | C Full Name | D Email | E Phone Number
 * F LinkedIn URL | G Current Role | H Target Role | I Biggest Challenge
 * J Additional Comments | K Status | L Source | M UTM Campaign
 */

var SHEET_NAME = "Waitlist"; // create a tab named Waitlist, or change this
var HEADER_ROW = 1;

function doPost(e) {
  try {
    var data = parseBody_(e);
    var result = upsertWaitlist_(data);
    return json_(result);
  } catch (err) {
    return json_({
      ok: false,
      code: "error",
      error: String(err && err.message ? err.message : err),
    });
  }
}

function doGet() {
  return json_({ ok: true, service: "PrepAlign Waitlist" });
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Empty request body");
  }
  var data = JSON.parse(e.postData.contents);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid JSON body");
  }
  return data;
}

function upsertWaitlist_(data) {
  var fullName = clean_(data.full_name || data.fullName);
  var email = clean_(data.email).toLowerCase();
  var phone = clean_(data.phone || data.phone_number || data.phoneNumber);
  var linkedin = clean_(data.linkedin_url || data.linkedinUrl || data.linkedin);
  var currentRole = clean_(data.current_role || data.currentRole);
  var targetRole = clean_(data.target_role || data.targetRole);
  var challenge = clean_(data.biggest_challenge || data.biggestChallenge);
  var comments = clean_(data.comments || data.additional_comments || "");
  var source = clean_(data.source || data.utm_source || "direct") || "direct";
  var utmCampaign = clean_(data.utm_campaign || data.utmCampaign || "");

  if (!fullName) throw new Error("Full name is required");
  if (!email || !isValidEmail_(email)) throw new Error("Please enter a valid email");
  if (!isValidPhone_(phone)) throw new Error("Please enter a valid phone number");
  if (!currentRole) throw new Error("Current role is required");
  if (!targetRole) throw new Error("Target role is required");
  if (!challenge) throw new Error("Biggest challenge is required");
  if (linkedin && !/^https?:\/\//i.test(linkedin)) {
    throw new Error("LinkedIn URL must start with http:// or https://");
  }

  var sheet = getSheet_();
  ensureHeader_(sheet);

  if (emailExists_(sheet, email)) {
    return {
      ok: false,
      code: "duplicate",
      error: "This email is already on the waitlist.",
    };
  }

  var waitlistId = nextWaitlistId_();
  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "Asia/Kolkata",
    "yyyy-MM-dd HH:mm:ss"
  );

  sheet.appendRow([
    waitlistId,
    timestamp,
    fullName,
    email,
    phone,
    linkedin || "",
    currentRole,
    targetRole,
    challenge,
    comments || "",
    "New",
    source,
    utmCampaign,
  ]);
  // Column E = Phone — force plain text so "+91..." is not mangled
  var row = sheet.getLastRow();
  sheet.getRange(row, 5).setNumberFormat("@").setValue(phone);

  return {
    ok: true,
    waitlist_id: waitlistId,
    message: "You're on the waitlist.",
  };
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() >= 1) {
    var first = sheet.getRange(1, 1, 1, 13).getValues()[0];
    if (String(first[0]).trim() !== "") return;
  }
  sheet.getRange(1, 1, 1, 13).setValues([[
    "Waitlist ID",
    "Timestamp",
    "Full Name",
    "Email",
    "Phone Number",
    "LinkedIn URL",
    "Current Role",
    "Target Role",
    "Biggest Challenge",
    "Additional Comments",
    "Status",
    "Source",
    "UTM Campaign",
  ]]);
}

function emailExists_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 4, last, 4).getValues(); // column D = Email
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || "").trim().toLowerCase() === email) return true;
  }
  return false;
}

function nextWaitlistId_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var props = PropertiesService.getScriptProperties();
    var n = parseInt(props.getProperty("WAITLIST_SEQ") || "0", 10);
    if (isNaN(n) || n < 0) n = 0;
    n += 1;
    props.setProperty("WAITLIST_SEQ", String(n));
    return "WL-" + pad_(n, 4);
  } finally {
    lock.releaseLock();
  }
}

function pad_(n, width) {
  var s = String(n);
  while (s.length < width) s = "0" + s;
  return s;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone_(phone) {
  var digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function clean_(v) {
  return String(v == null ? "" : v).trim();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
