import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Ban, Bot, Compass } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Magnetic } from "./Reveal";

const PROBLEMS = [
  {
    icon: Ban,
    label: "01",
    title: "Job boards dump noise",
    body: "Endless listings. Zero prioritization. You apply more, and learn nothing about what actually moves interviews.",
  },
  {
    icon: Bot,
    label: "02",
    title: "Generic AI tips",
    body: "Chatbots recycle the same advice for everyone. They don’t know your target role, market, or gaps.",
  },
  {
    icon: Compass,
    label: "03",
    title: "No signal for today",
    body: "Nothing tells you which company matches you, what to fix on your profile, or the highest-ROI action this week.",
  },
];

const PROBLEM_PHRASES = [
  {
    key: "blind",
    node: (
      <>
        Applying <span className="text-[var(--pa-muted-2)]">blindly</span> to every opening
      </>
    ),
  },
  {
    key: "smart",
    node: (
      <>
        Applying with <span className="text-[var(--pa-green)]">daily intelligence</span>
      </>
    ),
  },
];

function PhraseCycle({ phrases, intervalMs = 2800, className = "" }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const current = phrases[index] ?? phrases[0];

  useEffect(() => {
    if (reduce || phrases.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [phrases, intervalMs, reduce]);

  if (reduce) {
    return <p className={className}>{phrases[phrases.length - 1]?.node}</p>;
  }

  return (
    <div className="relative overflow-hidden w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={current.key}
          className={className}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.55 }}
        >
          {current.node}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function SpotlightCard({ children, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 28 });
  const glow = useMotionTemplate`radial-gradient(240px circle at ${springX}px ${springY}px, var(--pa-green-soft), transparent 55%)`;

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={reduce ? undefined : onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`saas-card relative overflow-hidden ${className}`}
    >
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: glow }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.22 }}
        />
      )}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </motion.div>
  );
}

export default function ProblemSection() {
  const reduce = useReducedMotion();

  return (
    <section id="problem" className="apple-section scroll-mt-16 relative overflow-hidden bg-[var(--pa-surface)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--pa-green)]/[0.08] blur-3xl"
          animate={reduce ? undefined : { x: [0, 24, 0], y: [0, 16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[var(--pa-ink)]/[0.04] blur-3xl"
          animate={reduce ? undefined : { x: [0, -18, 0], y: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="saas-divider absolute inset-x-0 top-0" />
      </div>

      <div className="apple-page relative">
        <Reveal className="saas-section-head-center" blur>
          <p className="apple-eyebrow">The problem</p>
          <h2 className="apple-headline">
            You&apos;re not unqualified.
            <br className="hidden sm:block" />
            You&apos;re applying blind.
          </h2>
          <p className="apple-subhead apple-subhead-center">
            The market rewards signal, not volume. Most tools give you noise.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-10 sm:mt-12 mx-auto max-w-3xl text-center px-2 min-h-[3.25rem] sm:min-h-[3.75rem] flex items-center justify-center">
            <PhraseCycle
              phrases={PROBLEM_PHRASES}
              intervalMs={2800}
              className="pa-display text-center w-full"
            />
          </div>
        </Reveal>

        <Stagger className="pa-grid pa-grid-3 mt-10 sm:mt-12" stagger={0.1}>
          {PROBLEMS.map(({ icon: Icon, label, title, body }, i) => (
            <StaggerItem key={title} className="h-full">
              <Magnetic strength={0.12} className="h-full">
                <SpotlightCard>
                  <div className="flex items-center justify-between mb-6">
                    <motion.span
                      className="pa-icon-wrap pa-icon-wrap-ink"
                      initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 18,
                        delay: 0.08 * i,
                      }}
                    >
                      <Icon className="pa-icon" strokeWidth={1.75} />
                    </motion.span>
                    <span className="text-[length:var(--pa-text-eyebrow)] font-semibold tracking-[0.18em] text-[var(--pa-muted-2)] tabular-nums">
                      {label}
                    </span>
                  </div>
                  <h3 className="pa-title">{title}</h3>
                  <p className="saas-card-body">{body}</p>
                </SpotlightCard>
              </Magnetic>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.12}>
          <p className="mt-10 sm:mt-12 text-center pa-caption max-w-md mx-auto">
            PrepAlign exists to replace guesswork with{" "}
            <span className="text-[var(--pa-ink)] font-medium">daily career intelligence</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
