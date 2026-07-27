import { useEffect, useState } from "react";

const WAITLIST_UNLOCK_KEY = "prepalign_waitlist_report_unlocked";
const WAITLIST_JOINED_EVENT = "prepalign:waitlist-joined";

/** True after a successful waitlist join on this browser (UX gate only). */
export function isReportUnlocked() {
  try {
    return localStorage.getItem(WAITLIST_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function hasJoinedWaitlist() {
  return isReportUnlocked();
}

export function unlockSampleReport() {
  try {
    localStorage.setItem(WAITLIST_UNLOCK_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
  try {
    window.dispatchEvent(new Event(WAITLIST_JOINED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Reactively track waitlist join / report unlock across Layout + Home. */
export function useWaitlistJoined() {
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const sync = () => setJoined(isReportUnlocked());
    sync();
    window.addEventListener(WAITLIST_JOINED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WAITLIST_JOINED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return joined;
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
