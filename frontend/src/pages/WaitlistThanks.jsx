import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Download, Clock, Mail } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { useWaitlistJoined, openSampleReport } from "../lib/sampleReport";

const NEXT_STEPS = [
  {
    icon: Clock,
    title: "We reach out within 24 hours",
    body: "Our team will contact you with the next steps for early access.",
  },
  {
    icon: Mail,
    title: "We keep you posted",
    body: "You will get updates on your waitlist status as spots open.",
  },
];

export default function WaitlistThanks() {
  const reportUnlocked = useWaitlistJoined();

  return (
    <div data-testid="page-waitlist-thanks" className="bg-[var(--pa-surface)]">
      <div className="apple-page apple-page-y">
        <Reveal className="max-w-2xl mx-auto text-center">
          <div className="pa-icon-wrap !w-16 !h-16 !bg-[var(--pa-green)] !text-[var(--pa-on-green)] mb-8 mx-auto">
            <Check className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <p className="apple-eyebrow">You&apos;re in</p>
          <h1 className="apple-headline mt-3">
            Thank you for trusting PrepAlign.
          </h1>
          <p className="apple-subhead apple-subhead-center mt-5">
            You are on the early access waitlist. We will reach out within 24 hours with further steps, and we will keep you posted on your waitlist status.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="max-w-xl mx-auto mt-10 sm:mt-12">
          <div className="apple-panel text-left space-y-6">
            <p className="apple-eyebrow">What happens next</p>
            {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="pa-icon-wrap shrink-0">
                  <Icon className="pa-icon" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h2 className="saas-card-title">{title}</h2>
                  <p className="saas-card-body">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            {reportUnlocked && (
              <button
                type="button"
                onClick={openSampleReport}
                className="apple-btn apple-btn-whatsapp w-full sm:w-auto"
                data-testid="thanks-download-report"
              >
                <Download className="pa-icon" strokeWidth={1.75} /> Download Sample Report
              </button>
            )}
            <Link
              to="/#intelligence-preview"
              className="apple-btn apple-btn-dark w-full sm:w-auto"
              data-testid="thanks-home-btn"
            >
              Back to home <ArrowRight className="pa-icon" strokeWidth={1.75} />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
