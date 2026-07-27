import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Radar, UserRoundSearch, ListChecks, ChartNoAxesCombined } from "lucide-react";
import { SectionGlow } from "./SectionMotion";

const EASE = [0.22, 1, 0.36, 1];
const CYCLE_MS = 3400;

const STEPS = [
  {
    n: "01",
    icon: Radar,
    title: "Read the market",
    body: "Hiring signals, funding, and role trends, daily.",
  },
  {
    n: "02",
    icon: UserRoundSearch,
    title: "Match your profile",
    body: "Opportunity scores against your goals and experience.",
  },
  {
    n: "03",
    icon: ListChecks,
    title: "Surface actions",
    body: "Resume, LinkedIn, outreach, and proof-of-work next steps.",
  },
  {
    n: "04",
    icon: ChartNoAxesCombined,
    title: "Compound weekly",
    body: "Market briefs that keep you ahead of the pile.",
  },
];

const TITLE_WORDS = ["An", "AI", "Career", "Intelligence", "Platform."];

/** Kinetic word reveal for the section headline. */
function KineticTitle({ words, className = "" }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <h2 className={className}>{words.join(" ")}</h2>;
  }

  return (
    <h2 className={`${className} flex flex-wrap gap-x-[0.28em] gap-y-1`} aria-label={words.join(" ")}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-1">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
            whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.08 + i * 0.07,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/**
 * Walkthrough motion: auto-cycling step stage with slide + progress pills.
 * Replaces the scroll-rail / sticky timeline treatment.
 */
export default function AboutSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[active];
  const Icon = step.icon;

  useEffect(() => {
    if (reduce || paused) return undefined;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce, paused]);

  return (
    <section
      id="about"
      className="apple-section bg-[var(--pa-panel)] border-y border-[var(--pa-border)] scroll-mt-16 relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SectionGlow side="center" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(14,23,18,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(180deg, black, transparent 88%)",
        }}
        aria-hidden
      />

      <div className="apple-page relative">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            className="apple-eyebrow"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            What is PrepAlign?
          </motion.p>

          <KineticTitle
            words={TITLE_WORDS}
            className="apple-headline mt-3 justify-center text-balance"
          />

          <motion.p
            className="apple-subhead apple-subhead-center mt-5 text-pretty"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
          >
            PrepAlign analyzes hiring signals, company trends, skills, and market data to tell you what to do next, so you apply smarter, not more.
          </motion.p>
        </div>

        {/* Stage */}
        <div className="mt-10 sm:mt-12 max-w-3xl mx-auto">
          <div
            className="relative overflow-hidden rounded-[var(--pa-r-xl)] border border-[var(--pa-border-strong)] bg-[var(--pa-surface)] shadow-[var(--pa-shadow-md)] min-h-[220px] sm:min-h-[240px]"
            aria-live="polite"
          >
            {/* Soft ambient wash that shifts with step */}
            <motion.div
              key={`wash-${step.n}`}
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--pa-green)]/20 blur-3xl"
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              aria-hidden
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={step.n}
                className="relative px-6 py-8 sm:px-10 sm:py-10"
                initial={
                  reduce
                    ? false
                    : { opacity: 0, x: 36, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? undefined
                    : { opacity: 0, x: -28, filter: "blur(6px)" }
                }
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="flex items-center justify-between gap-4 mb-6">
                  <motion.span
                    className="pa-icon-wrap !w-12 !h-12"
                    initial={reduce ? false : { scale: 0.7, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <Icon className="pa-icon" strokeWidth={1.75} />
                  </motion.span>
                  <span className="text-[length:var(--pa-text-eyebrow)] font-semibold tracking-[0.18em] uppercase text-[var(--pa-muted-2)] tabular-nums">
                    Step {step.n}
                  </span>
                </div>

                <h3 className="text-[1.35rem] sm:text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--pa-ink)] text-balance">
                  {step.title}
                </h3>
                <p className="mt-3 text-[var(--pa-muted)] text-[1.02rem] leading-relaxed max-w-lg text-pretty">
                  {step.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Bottom progress for current cycle */}
            {!reduce && (
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--pa-surface-3)]">
                <motion.div
                  key={`bar-${active}-${paused}`}
                  className="h-full bg-[var(--pa-green)] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? undefined : 1 }}
                  transition={
                    paused
                      ? { duration: 0 }
                      : { duration: CYCLE_MS / 1000, ease: "linear" }
                  }
                />
              </div>
            )}
          </div>

          {/* Step selectors */}
          <div
            className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
            role="tablist"
            aria-label="How PrepAlign works"
          >
            {STEPS.map((s, i) => {
              const SIcon = s.icon;
              const isOn = i === active;
              return (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  onClick={() => setActive(i)}
                  className={`relative text-left rounded-[var(--pa-r-lg)] border px-3.5 py-3 min-h-[3.25rem] transition-[border-color,background-color,box-shadow] duration-[var(--pa-duration)] ease-[var(--pa-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pa-green)] focus-visible:outline-offset-2 ${
                    isOn
                      ? "border-[var(--pa-green-border)] bg-[var(--pa-surface-2)] shadow-[var(--pa-shadow-sm)]"
                      : "border-[var(--pa-border)] bg-[var(--pa-panel)] hover:border-[var(--pa-border-strong)]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <SIcon
                      className={`pa-icon shrink-0 ${isOn ? "text-[var(--pa-green-deep)]" : "text-[var(--pa-muted)]"}`}
                      strokeWidth={1.75}
                    />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--pa-muted-2)] tabular-nums">
                        {s.n}
                      </span>
                      <span className="block text-[13px] font-semibold tracking-tight text-[var(--pa-ink)] truncate">
                        {s.title}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
