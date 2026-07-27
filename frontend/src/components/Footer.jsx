import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Download, Check } from "lucide-react";
import { handleSectionClick } from "../lib/scroll";
import { useWaitlistJoined, openSampleReport } from "../lib/sampleReport";

export default function Footer() {
  const joined = useWaitlistJoined();

  return (
    <footer className="bg-[var(--pa-ink)] text-[var(--pa-on-ink)] border-t border-white/5" data-testid="site-footer">
      <div className="apple-page py-16 sm:py-20 md:py-24 text-center">
        <p className="apple-eyebrow !text-[var(--pa-on-ink-faint)]">
          {joined ? "You're on the list" : "Early access"}
        </p>
        <h2 className="apple-headline !text-[var(--pa-on-ink)] mt-4 max-w-xl mx-auto">
          {joined ? "Review your sample intelligence." : "Free for the first 30 days."}
        </h2>
        <p className="apple-subhead apple-subhead-center !text-[var(--pa-on-ink-muted)] mt-4">
          {joined
            ? "We'll email you when your early access spot opens."
            : "Join the waitlist and be first to experience PrepAlign."}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {joined ? (
            <>
              <button
                type="button"
                onClick={openSampleReport}
                className="apple-btn apple-btn-whatsapp w-full sm:w-auto max-w-sm"
                data-testid="footer-download-report-btn"
              >
                <Download className="pa-icon" strokeWidth={1.75} /> Download Sample Report
              </button>
              <a
                href="/#intelligence-preview"
                onClick={(e) => handleSectionClick(e, "intelligence-preview")}
                className="apple-btn apple-btn-ghost-dark w-full sm:w-auto max-w-sm"
                data-testid="footer-review-btn"
              >
                <Check className="pa-icon" strokeWidth={1.75} /> Review preview
              </a>
            </>
          ) : (
            <a
              href="/#waitlist"
              onClick={(e) => handleSectionClick(e, "waitlist")}
              className="apple-btn apple-btn-whatsapp w-full sm:w-auto max-w-sm"
              data-testid="footer-waitlist-btn"
            >
              Join the Waitlist <ArrowUpRight className="pa-icon" strokeWidth={1.75} />
            </a>
          )}
        </div>

        <nav
          className="mt-14 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-[var(--pa-on-ink-muted)]"
          aria-label="Footer"
        >
          <a href="/#about" onClick={(e) => handleSectionClick(e, "about")} className="hover:text-[var(--pa-on-ink)] transition-colors min-h-[2.75rem] inline-flex items-center">About</a>
          <a href="/#early-access" onClick={(e) => handleSectionClick(e, "early-access")} className="hover:text-[var(--pa-on-ink)] transition-colors min-h-[2.75rem] inline-flex items-center">Early Access</a>
          <a href="/#faq" onClick={(e) => handleSectionClick(e, "faq")} className="hover:text-[var(--pa-on-ink)] transition-colors min-h-[2.75rem] inline-flex items-center">FAQ</a>
          <Link to="/privacy" className="hover:text-[var(--pa-on-ink)] transition-colors min-h-[2.75rem] inline-flex items-center">Privacy</Link>
          <Link to="/terms" className="hover:text-[var(--pa-on-ink)] transition-colors min-h-[2.75rem] inline-flex items-center">Terms</Link>
        </nav>

        <p className="mt-10 text-xs text-[var(--pa-on-ink-faint)] tracking-tight px-2">
          © {new Date().getFullYear()} PrepAlign. AI Career Intelligence Platform.
        </p>
      </div>
    </footer>
  );
}
