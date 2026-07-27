import React from "react";
import { Sparkles, Download } from "lucide-react";
import { handleSectionClick } from "../lib/scroll";
import { useWaitlistJoined, openSampleReport } from "../lib/sampleReport";

export default function StickyMobileCTA() {
  const joined = useWaitlistJoined();

  if (joined) {
    return (
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--pa-border)] bg-[var(--pa-panel)] pb-[env(safe-area-inset-bottom,0px)]"
        data-testid="sticky-mobile-cta"
      >
        <button
          type="button"
          onClick={openSampleReport}
          className="apple-btn apple-btn-whatsapp w-full !rounded-none min-h-12"
          data-testid="sticky-download-report-btn"
        >
          <Download className="pa-icon" strokeWidth={1.75} /> Download Sample Report
        </button>
      </div>
    );
  }

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--pa-border)] bg-[var(--pa-panel)] pb-[env(safe-area-inset-bottom,0px)]"
      data-testid="sticky-mobile-cta"
    >
      <a
        href="/#waitlist"
        onClick={(e) => handleSectionClick(e, "waitlist")}
        className="apple-btn apple-btn-whatsapp w-full !rounded-none min-h-12"
        data-testid="sticky-waitlist-btn"
      >
        <Sparkles className="pa-icon" strokeWidth={1.75} /> Join Early Access Waitlist
      </a>
    </div>
  );
}
