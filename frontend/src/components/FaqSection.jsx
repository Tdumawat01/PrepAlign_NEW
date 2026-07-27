import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { handleSectionClick } from "../lib/scroll";

const EASE = [0.22, 1, 0.36, 1];

const FAQ_ITEMS = [
  {
    q: "What is PrepAlign?",
    a: "PrepAlign is an AI Career Intelligence Platform. It analyzes hiring signals, company trends, skills, and market data to tell you exactly what to do next to maximize interview chances.",
  },
  {
    q: "Is early access really free?",
    a: "Yes. The first cohort gets 30 days of free early access with personalized intelligence, daily signals, and weekly briefs.",
  },
  {
    q: "When will I get access?",
    a: "We're onboarding early users in limited batches. Join the waitlist and we'll email you when your spot opens.",
  },
  {
    q: "Who is this for?",
    a: "Ambitious students, graduates, career switchers, and professionals targeting Founder's Office, Product, GTM, AI ops, and related roles.",
  },
  {
    q: "Do I need to pay after 30 days?",
    a: "Early members will get preferred pricing. Nothing is charged during the free early-access period.",
  },
];

function FaqItem({ item, index, open, onToggle, reduce }) {
  const isOpen = open === index;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.05 }}
      className={`rounded-[var(--pa-r-xl)] border transition-[border-color,background-color,box-shadow] duration-[var(--pa-duration)] ease-[var(--pa-ease)] ${
        isOpen
          ? "border-[var(--pa-green-border)] bg-[var(--pa-panel)] shadow-[var(--pa-shadow-sm)]"
          : "border-[var(--pa-border-strong)] bg-[var(--pa-surface)] hover:border-[rgba(15,23,42,0.2)]"
      }`}
    >
      <button
        type="button"
        id={`faq-trigger-${index}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 min-h-[3.5rem]"
      >
        <span className="font-semibold tracking-tight text-[var(--pa-ink)] text-[0.95rem] sm:text-base pr-2">
          {item.q}
        </span>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--pa-duration)] ${
            isOpen
              ? "border-[var(--pa-green-border)] bg-[var(--pa-green-soft)] text-[var(--pa-green-deep)]"
              : "border-[var(--pa-border-strong)] bg-[var(--pa-panel)] text-[var(--pa-muted)]"
          }`}
          aria-hidden
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="inline-flex"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-trigger-${index}`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 pa-body max-w-prose">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);

  const onToggle = (index) => {
    setOpen((prev) => (prev === index ? -1 : index));
  };

  return (
    <section id="faq" className="apple-section bg-[var(--pa-surface-2)] scroll-mt-16 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-[var(--pa-green)]/[0.08] blur-3xl"
        aria-hidden
      />

      <div className="apple-page relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <Reveal className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="apple-eyebrow">FAQ</p>
            <h2 className="apple-headline mt-3 text-balance">Questions, answered.</h2>
            <p className="apple-subhead mt-5 text-pretty">
              Everything you need to know about early access, pricing, and who PrepAlign is built for.
            </p>
            <a
              href="/#waitlist"
              onClick={(e) => handleSectionClick(e, "waitlist")}
              className="mt-8 inline-flex text-sm font-semibold text-[var(--pa-green-deep)] hover:text-[var(--pa-ink)] transition-colors"
            >
              Still unsure? Join the waitlist →
            </a>
          </Reveal>

          <div className="lg:col-span-8 space-y-3" role="list">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.q} role="listitem">
                <FaqItem
                  item={item}
                  index={index}
                  open={open}
                  onToggle={onToggle}
                  reduce={!!reduce}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
