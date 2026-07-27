import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Download,
} from "lucide-react";
import { BRAND } from "../lib/constants";
import {
  isReportUnlocked,
  unlockSampleReport,
  openSampleReport,
} from "../lib/sampleReport";
import {
  submitWaitlist,
  getWaitlistErrorMessage,
} from "../services/waitlist";
import { Reveal, Stagger, StaggerItem, Magnetic } from "../components/Reveal";
import HeroShowcase from "../components/HeroShowcase";
import LivePulse from "../components/LivePulse";
import TextCycle from "../components/TextCycle";
import AnimatedNumber from "../components/AnimatedNumber";
import { SectionGlow } from "../components/SectionMotion";
import EarlyAccessSection from "../components/EarlyAccessSection";
import ProblemSection from "../components/ProblemSection";
import AboutSection from "../components/AboutSection";
import FaqSection from "../components/FaqSection";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "../components/ui/select";

const HERO_OUTCOMES = [
  "daily signals.",
  "clear next steps.",
  "ranked opportunities.",
];

const FIELD =
  "saas-input mt-2 focus-visible:ring-0 focus-visible:ring-offset-0";

const PREVIEW_CARDS = [
  { label: "Today's Best Company", value: "Apply to Nimbus Labs", meta: "Series B, AI Ops hiring surge", score: "96" },
  { label: "Opportunity Score", value: "96 / 100", meta: "Top 4% match for your profile", score: null },
  { label: "Recommended Proof-of-Work", value: "Build a GTM signal dashboard", meta: "3 to 5 day project, high ROI", score: null },
  { label: "Hidden Hiring Signal", value: "Looking for ops + AI fluency", meta: "Not listed in the JD", score: null },
  { label: "Top Skill This Week", value: "Claude + spreadsheet workflows", meta: "Cited in 18 similar roles", score: null },
  { label: "Resume Update", value: "Add 'AI-assisted research'", meta: "Keyword gap vs. peers", score: null },
  { label: "Highest ROI Action Today", value: "Warm intro to hiring manager", meta: "Predicted reply rate +2.4x", score: null },
];

const WHY_EARLY = [
  { icon: Zap, title: "Shape the product", body: "Your feedback directly influences what PrepAlign ships first." },
  { icon: Lock, title: "Free for 30 days", body: "Full early-access intelligence at no cost while we refine the experience." },
  { icon: Sparkles, title: "Exclusive reports", body: "Weekly market briefs and personalized signals before public launch." },
];

const TARGET_ROLES = [
  "Founder's Office",
  "Product",
  "Product Operations",
  "GTM / Growth",
  "GTM Engineering",
  "AI Operations",
  "Strategy / BizOps",
  "Customer Success",
  "Marketing",
  "Sales",
  "Other",
];

const CHALLENGES = [
  "Finding relevant jobs",
  "Getting interview calls",
  "Resume",
  "Networking",
  "Cold outreach",
  "Interview preparation",
  "Career clarity",
  "Building projects",
  "Standing out from other applicants",
  "Other",
];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  linkedin_url: "",
  current_role: "",
  target_role: "",
  biggest_challenge: "",
  comments: "",
};

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [reportUnlocked, setReportUnlocked] = useState(false);

  useEffect(() => {
    setReportUnlocked(isReportUnlocked());
  }, []);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (hash) {
      const t = setTimeout(() => scrollToId(hash), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [location.hash]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleDownloadReport = () => {
    if (!reportUnlocked) {
      toast.message("Join the waitlist first", {
        description: "Unlock the sample intelligence report after you sign up.",
      });
      scrollToId("waitlist");
      return;
    }
    openSampleReport();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitWaitlist(form);
      unlockSampleReport();
      setReportUnlocked(true);
      setForm(EMPTY_FORM);
      navigate("/waitlist/thanks", { replace: true });
    } catch (err) {
      toast.error(getWaitlistErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="page-home" className="bg-[var(--pa-surface)] text-[var(--pa-ink)]">
      {/* HERO */}
      <section
        id="home"
        className="relative min-h-[min(88vh,880px)] flex flex-col justify-center overflow-x-clip overflow-y-visible bg-[var(--pa-surface-2)] scroll-mt-16"
      >
        <div className="hero-mesh" aria-hidden>
          <div className="hero-mesh-blob hero-mesh-a" />
          <div className="hero-mesh-blob hero-mesh-b" />
          <div className="hero-mesh-blob hero-mesh-c" />
        </div>

        <div className="relative z-10 apple-page py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="min-w-0">
              <Reveal>
                <span className="saas-badge">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--pa-green)]" />
                  Early access · Free for 30 days
                </span>
              </Reveal>

              <Reveal delay={0.04}>
                <p className="pa-hero-title mt-6">{BRAND.name}</p>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className="pa-display mt-4 max-w-[22ch]">
                  Stop applying blindly.
                  <br />
                  <span className="text-[var(--pa-ink)]">Start applying with </span>
                  <TextCycle
                    words={HERO_OUTCOMES}
                    intervalMs={2800}
                    className="text-[var(--pa-green-deep)]"
                    data-testid="hero-text-cycle"
                  />
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="apple-subhead mt-6">
                  Personalized career intelligence. PrepAlign reads hiring signals every day so you know exactly what to do next.
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-8 apple-cta-row">
                  <Magnetic>
                    <a
                      href="#waitlist"
                      onClick={(e) => { e.preventDefault(); scrollToId("waitlist"); }}
                      className="apple-btn apple-btn-whatsapp"
                      data-testid="hero-waitlist-btn"
                    >
                      Join the Waitlist <ArrowRight className="pa-icon" strokeWidth={1.75} />
                    </a>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <a
                      href="#intelligence-preview"
                      onClick={(e) => { e.preventDefault(); scrollToId("intelligence-preview"); }}
                      className="apple-btn apple-btn-dark"
                      data-testid="hero-sample-btn"
                    >
                      See Sample Report
                    </a>
                  </Magnetic>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 sm:gap-y-2 pa-caption font-medium list-none p-0 m-0">
                  {["Daily hiring signals", "Ranked next actions", "Founding member access"].map((item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--pa-green)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="min-w-0">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <ProblemSection />

      {/* ABOUT */}
      <AboutSection />

      <EarlyAccessSection onJoinWaitlist={() => scrollToId("waitlist")} />

      {/* SAMPLE REPORT / dashboard preview */}
      <section id="intelligence-preview" className="apple-section bg-[var(--pa-ink)] text-[var(--pa-on-ink)] scroll-mt-16">
        <div className="apple-page">
          <Reveal className="saas-section-head max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <p className="apple-eyebrow !text-[var(--pa-green)]">Example intelligence</p>
              <LivePulse label="Sample feed" className="text-[var(--pa-on-ink-faint)]" />
            </div>
            <h2 className="apple-headline !text-[var(--pa-on-ink)]">Sample intelligence report</h2>
            <p className="apple-subhead !text-[var(--pa-on-ink-muted)]">
              A glimpse of the daily signals PrepAlign surfaces: ranked, personalized, actionable.
            </p>

            <div className="mt-8">
              {reportUnlocked ? (
                <Magnetic>
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="apple-btn apple-btn-whatsapp w-full sm:w-auto"
                    data-testid="download-sample-report"
                  >
                    <Download className="pa-icon" strokeWidth={1.75} /> Download Sample Report
                  </button>
                </Magnetic>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="apple-btn apple-btn-ghost-dark w-full sm:w-auto"
                    data-testid="download-sample-report-locked"
                  >
                    <Lock className="pa-icon" strokeWidth={1.75} /> Download Sample Report
                  </button>
                  <p className="pa-caption !text-[var(--pa-on-ink-faint)]">
                    Unlocks after you join the waitlist.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Stagger className="pa-grid pa-grid-3 mt-10 sm:mt-12" stagger={0.05}>
            {PREVIEW_CARDS.map((card) => (
              <StaggerItem key={card.label} className="h-full">
                <div className="saas-card-dark">
                  <div className="flex items-start justify-between gap-3">
                    <p className="saas-card-label">{card.label}</p>
                    {card.score ? (
                      <span className="pa-chip-score">
                        <AnimatedNumber value={Number(card.score)} duration={1.35} />
                      </span>
                    ) : null}
                  </div>
                  <p className="saas-card-value">{card.value}</p>
                  <p className="saas-card-meta">{card.meta}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WHY EARLY */}
      <section id="why-early" className="apple-section bg-[var(--pa-surface)] scroll-mt-16 relative overflow-hidden">
        <SectionGlow side="right" />
        <div className="apple-page relative">
          <Reveal className="saas-section-head-center">
            <p className="apple-eyebrow">Why join early?</p>
            <h2 className="apple-headline">Be first. Get free access. Shape what we build.</h2>
          </Reveal>
          <Stagger className="pa-grid pa-grid-3 mt-10 sm:mt-12" stagger={0.07}>
            {WHY_EARLY.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title} className="h-full">
                <div className="saas-card">
                  <div className="pa-icon-wrap mb-4">
                    <Icon className="pa-icon" strokeWidth={1.75} />
                  </div>
                  <h3 className="pa-title">{title}</h3>
                  <p className="saas-card-body">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="apple-section bg-[var(--pa-surface-2)] scroll-mt-16 relative overflow-hidden">
        <SectionGlow side="left" />
        <div className="apple-page relative">
          <Reveal className="saas-section-head-center mb-10 sm:mb-12">
            <p className="apple-eyebrow">Waitlist</p>
            <h2 className="apple-headline">Join the Early Access Waitlist</h2>
            <p className="apple-subhead apple-subhead-center">
              Limited seats. Free for 30 days.
              {!reportUnlocked && " Join to unlock the sample intelligence report."}
            </p>
          </Reveal>

          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="apple-panel max-w-xl mx-auto space-y-5"
              data-testid="waitlist-form"
              noValidate
            >
              <div>
                <Label className="apple-label">Full Name *</Label>
                <Input data-testid="waitlist-input-name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className={FIELD} autoComplete="name" />
              </div>
              <div>
                <Label className="apple-label">Email *</Label>
                <Input type="email" data-testid="waitlist-input-email" value={form.email} onChange={(e) => update("email", e.target.value)} className={FIELD} autoComplete="email" />
              </div>
              <div>
                <Label className="apple-label">Phone Number *</Label>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="+919876543210"
                  data-testid="waitlist-input-phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={(e) => {
                    const n = e.target.value.replace(/[^\d+]/g, "");
                    if (n !== e.target.value) update("phone", n);
                  }}
                  className={FIELD}
                  autoComplete="tel"
                />
                <p className="mt-2 pa-caption">
                  Include country code, no spaces. Example: +919876543210
                </p>
              </div>
              <div>
                <Label className="apple-label">
                  LinkedIn <span className="font-normal text-[var(--pa-muted-2)]">(optional)</span>
                </Label>
                <Input type="url" placeholder="https://www.linkedin.com/in/…" data-testid="waitlist-input-linkedin" value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} className={FIELD} />
              </div>
              <div>
                <Label className="apple-label">Current Role *</Label>
                <Input data-testid="waitlist-input-current-role" value={form.current_role} onChange={(e) => update("current_role", e.target.value)} className={FIELD} />
              </div>
              <div>
                <Label className="apple-label">Target Role *</Label>
                <Select value={form.target_role} onValueChange={(v) => update("target_role", v)}>
                  <SelectTrigger className={`${FIELD} focus:ring-0 focus:ring-offset-0`} data-testid="waitlist-select-target-role">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--pa-r-lg)]">
                    {TARGET_ROLES.map((r) => <SelectItem key={r} value={r} className="rounded-[var(--pa-r-md)]">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="apple-label">Biggest Challenge *</Label>
                <Select value={form.biggest_challenge} onValueChange={(v) => update("biggest_challenge", v)}>
                  <SelectTrigger className={`${FIELD} focus:ring-0 focus:ring-offset-0`} data-testid="waitlist-select-challenge">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--pa-r-lg)]">
                    {CHALLENGES.map((c) => <SelectItem key={c} value={c} className="rounded-[var(--pa-r-md)]">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="apple-label">
                  Additional Comments <span className="font-normal text-[var(--pa-muted-2)]">(optional)</span>
                </Label>
                <Textarea
                  rows={3}
                  maxLength={2000}
                  data-testid="waitlist-input-comments"
                  value={form.comments}
                  onChange={(e) => update("comments", e.target.value)}
                  className="saas-input mt-2 !h-auto py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Magnetic strength={0.12} className="w-full pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="apple-btn apple-btn-dark w-full justify-center"
                  data-testid="waitlist-submit-btn"
                >
                  {submitting ? "Submitting…" : "Get Early Access"}
                </button>
              </Magnetic>
            </form>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />
    </div>
  );
}
