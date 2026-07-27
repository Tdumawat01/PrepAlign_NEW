import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="apple-page apple-page-y min-h-[70vh] flex items-center" data-testid="page-coming-soon">
      <div className="max-w-lg mx-auto text-center w-full">
        <div className="pa-icon-wrap !w-14 !h-14 mx-auto mb-6 bg-[var(--pa-surface-2)] text-[var(--pa-ink-soft)]">
          <Lock className="pa-icon" strokeWidth={1.75} />
        </div>
        <h1 className="apple-headline">Private early access</h1>
        <p className="apple-subhead apple-subhead-center mt-4">
          PrepAlign is currently in private early access. Join the waitlist to be among the first users.
        </p>
        <Link
          to="/#waitlist"
          className="apple-btn apple-btn-whatsapp mt-8 w-full sm:w-auto"
          data-testid="coming-soon-waitlist"
        >
          Join the Waitlist <ArrowRight className="pa-icon" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
