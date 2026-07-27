const WAITLIST_UNLOCK_KEY = "prepalign_waitlist_report_unlocked";

export function isReportUnlocked() {
  try {
    return localStorage.getItem(WAITLIST_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockSampleReport() {
  try {
    localStorage.setItem(WAITLIST_UNLOCK_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Public asset path — only trigger download after waitlist unlock. */
export const SAMPLE_REPORT_PATH =
  "/PrepAlign-Weekly-Career-Intelligence-Report.pdf";

export const SAMPLE_REPORT_FILENAME =
  "PrepAlign-Weekly-Career-Intelligence-Report.pdf";

/**
 * Download the sample intelligence report PDF.
 * Call only after `isReportUnlocked()` / successful waitlist join.
 *
 * NOTE: This is a UX gate only. The PDF lives in `public/` and is not an
 * authorization boundary. Treat as public marketing content, or move behind
 * a signed URL if privacy is required.
 */
export function openSampleReport() {
  if (!isReportUnlocked()) {
    window.location.hash = "#waitlist";
    return;
  }

  const a = document.createElement("a");
  a.href = SAMPLE_REPORT_PATH;
  a.download = SAMPLE_REPORT_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
