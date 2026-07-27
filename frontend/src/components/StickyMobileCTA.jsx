import React from "react";
import { Sparkles } from "lucide-react";
import { handleSectionClick } from "../lib/scroll";

export default function StickyMobileCTA() {
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
