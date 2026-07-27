import React from "react";
import {
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  Building2,
  MessageCircle,
  Rocket,
  AudioLines,
  MessagesSquare,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Reveal, Stagger, StaggerItem, Magnetic } from "./Reveal";
import { SectionGlow } from "./SectionMotion";

const FOUNDING_BENEFITS = [
  {
    icon: FileText,
    title: "Weekly Career Intelligence Reports",
    body: "Market briefs with hiring heat, role shifts, and what to do this week.",
  },
  {
    icon: Sparkles,
    title: "Personalized Career Recommendations",
    body: "Actions ranked for your goals, not generic chatbot advice.",
  },
  {
    icon: Building2,
    title: "Company & Opportunity Intelligence",
    body: "Which companies match you, with scores and hidden hiring signals.",
  },
  {
    icon: MessageCircle,
    title: "Direct Founder Access",
    body: "Talk to the team building PrepAlign. Your feedback shapes the roadmap.",
  },
  {
    icon: Rocket,
    title: "Priority access to every new feature",
    body: "Founding members unlock new tools first, before public launch.",
  },
];

const COMING_SOON = [
  {
    icon: AudioLines,
    title: "Voice AI Career Coach",
    body: "Talk through career decisions out loud. Natural voice conversations about planning, strategy, and what to do next.",
  },
  {
    icon: MessagesSquare,
    title: "AI Chat Workspace",
    body: "A workspace that remembers your resume, applications, goals, and past chats, so guidance stays continuous.",
  },
];

function ComingSoonBadge() {
  const reduce = useReducedMotion();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pa-border-strong)] bg-[var(--pa-surface)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--pa-muted)]">
      <span className="relative flex h-1.5 w-1.5">
        {!reduce && (
          <span className="coming-soon-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--pa-green)] opacity-70" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--pa-green)]" />
      </span>
      Coming Soon
    </span>
  );
}

export default function EarlyAccessSection({ onJoinWaitlist }) {
  return (
    <section id="early-access" className="apple-section bg-[var(--pa-surface)] scroll-mt-16 relative overflow-hidden">
      <SectionGlow side="left" />
      <div className="apple-page relative">
        <Reveal className="saas-section-head">
          <span className="saas-badge badge-shimmer mb-5">
            Limited Early Access · Free for the First 30 Days
          </span>
          <p className="apple-eyebrow">Early access</p>
          <h2 className="apple-headline">Free 30-Day Early Access</h2>
          <p className="apple-subhead">
            Join as a founding member. Get real intelligence now, and first access as PrepAlign ships voice coaching and a memory-rich chat workspace.
          </p>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12 mb-5">
          <p className="apple-eyebrow !text-[var(--pa-green-deep)]">Available now</p>
          <h3 className="pa-title mt-2">Founding Member Benefits</h3>
        </Reveal>

        <Stagger className="pa-grid pa-grid-3" stagger={0.06}>
          {FOUNDING_BENEFITS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} className="h-full">
              <div className="saas-card">
                <span className="pa-icon-wrap mb-4">
                  <Icon className="pa-icon" strokeWidth={1.75} />
                </span>
                <div className="flex items-start gap-2">
                  <Check className="pa-icon mt-0.5 text-pa-success shrink-0" strokeWidth={2.25} />
                  <div className="min-w-0">
                    <h4 className="saas-card-title">{title}</h4>
                    <p className="saas-card-body">{body}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-12 sm:mt-14 mb-5">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <p className="apple-eyebrow">On the roadmap</p>
            <ComingSoonBadge />
          </div>
          <h3 className="pa-title">Coming During Early Access</h3>
          <p className="pa-caption mt-2 max-w-lg">
            Two capabilities founding members get first. Not available yet, but shipping next.
          </p>
        </Reveal>

        <Stagger className="pa-grid pa-grid-2" stagger={0.1}>
          {COMING_SOON.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} className="h-full">
              <div className="saas-card border-dashed relative">
                <div className="absolute top-4 right-4">
                  <ComingSoonBadge />
                </div>
                <span className="pa-icon-wrap mb-4">
                  <Icon className="pa-icon" strokeWidth={1.75} />
                </span>
                <h4 className="saas-card-title pr-24 sm:pr-28">{title}</h4>
                <p className="saas-card-body">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.06}>
          <div className="mt-10 sm:mt-12">
            <Magnetic>
              <a
                href="#waitlist"
                onClick={(e) => {
                  e.preventDefault();
                  onJoinWaitlist?.();
                }}
                className="apple-btn apple-btn-dark w-full sm:w-auto"
                data-testid="early-access-cta"
              >
                Join the Early Access Waitlist <ArrowRight className="pa-icon" strokeWidth={1.75} />
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
