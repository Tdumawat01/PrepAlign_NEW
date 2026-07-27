import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** Soft ambient glow. Decorative, low opacity. */
export function SectionGlow({ className = "", side = "right" }) {
  const reduce = useReducedMotion();
  const pos =
    side === "left"
      ? "left-[-12%] top-[18%]"
      : side === "center"
        ? "left-1/2 top-[-10%] -translate-x-1/2"
        : "right-[-10%] top-[8%]";

  return (
    <div
      className={`pointer-events-none absolute ${pos} h-64 w-64 rounded-full bg-[var(--pa-green)]/[0.08] blur-3xl ${className}`}
      aria-hidden
    >
      {!reduce && (
        <motion.div
          className="h-full w-full rounded-full bg-[var(--pa-green)]/[0.1]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

export function ProcessSteps({ steps }) {
  const reduce = useReducedMotion();

  return (
    <div className="pa-grid pa-grid-4 mt-10 sm:mt-12">
      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
          className="saas-card"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pa-green)] text-[12px] font-semibold text-[var(--pa-on-green)] tabular-nums">
            {i + 1}
          </span>
          <h3 className="saas-card-title mt-3.5">{step.title}</h3>
          <p className="saas-card-body">{step.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function PainPoints({ items }) {
  const reduce = useReducedMotion();

  return (
    <div className="pa-grid pa-grid-3 mt-10 sm:mt-12 max-w-3xl mx-auto">
      {items.map((item, i) => (
        <motion.div
          key={item}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.05 * i }}
          className="saas-card text-center !py-6"
        >
          <span className="mx-auto mb-3.5 block h-1.5 w-1.5 rounded-full bg-[var(--pa-green)]" />
          <p className="text-[0.9rem] font-medium tracking-tight text-[var(--pa-ink)] leading-snug">
            {item}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
