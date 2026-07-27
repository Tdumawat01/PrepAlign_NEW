import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  useInView,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const CARDS = [
  {
    label: "Today's match",
    value: "Nimbus Labs",
    meta: "Series B · AI Ops surge",
    score: 96,
    accent: true,
  },
  {
    label: "Highest ROI action",
    value: "Warm intro to HM",
    meta: "Reply rate +2.4x",
  },
  {
    label: "Hidden signal",
    value: "Ops + AI fluency",
    meta: "Not listed in the JD",
  },
];

/** Stronger offsets so the jump-in is obvious */
const SLIDE_FROM = [120, -110, 130];

function CardFace({ card, playProgress }) {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[length:var(--pa-text-eyebrow)] font-semibold uppercase tracking-[0.14em] text-[var(--pa-muted)]">
          {card.label}
        </p>
        {card.score != null && (
          <span className="pa-chip-score">{card.score}</span>
        )}
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--pa-ink)] leading-snug">
        {card.value}
      </p>
      <p className="mt-1.5 text-sm text-[var(--pa-muted)] leading-snug">{card.meta}</p>
      {card.accent && (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[var(--pa-surface-2)]">
          <motion.div
            className="h-full rounded-full bg-[var(--pa-green)]"
            initial={reduce || !playProgress ? { width: "96%" } : { width: "0%" }}
            animate={{ width: "96%" }}
            transition={{ duration: 1.05, delay: 0.15, ease: EASE }}
          />
        </div>
      )}
    </>
  );
}

function StackCard({ card, index, inView, reduce, offsets }) {
  const fromX = SLIDE_FROM[index];
  const entered = reduce || inView;

  return (
    <motion.div
      className="absolute w-[86%]"
      style={{
        left: offsets.x,
        top: offsets.y,
        zIndex: index + 1,
      }}
      initial={false}
      animate={
        entered
          ? {
              opacity: 1,
              x: 0,
              scale: 1,
              rotate: offsets.rot,
            }
          : {
              opacity: 0,
              x: fromX,
              scale: 0.9,
              rotate: offsets.rot + (fromX > 0 ? 8 : -8),
            }
      }
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 18,
        mass: 0.85,
        delay: entered && !reduce ? 0.08 + index * 0.16 : 0,
      }}
    >
      <motion.div
        className="rounded-[var(--pa-r-xl)] border border-[var(--pa-border)] bg-[var(--pa-panel)] p-5 shadow-[var(--pa-shadow-lg)] will-change-transform"
        animate={
          reduce || !entered
            ? undefined
            : { y: [0, index % 2 === 0 ? -7 : 5, 0] }
        }
        transition={
          reduce || !entered
            ? undefined
            : {
                duration: 5 + index * 0.55,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.35 + index * 0.2,
              }
        }
      >
        <CardFace card={card} playProgress={entered} />
      </motion.div>
    </motion.div>
  );
}

/**
 * Product-as-visual hero.
 * Cards jump in from the sides when the showcase enters the viewport.
 */
export default function HeroShowcase({ className = "" }) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });

  const tiltRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 160, damping: 22, mass: 0.4 });
  const springY = useSpring(my, { stiffness: 160, damping: 22, mass: 0.4 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const offsets = [
    { x: "6%", y: "8%", rot: -4 },
    { x: "14%", y: "32%", rot: 2 },
    { x: "2%", y: "56%", rot: -1.5 },
  ];

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      {/* Mobile / tablet */}
      <div className="flex flex-col gap-3 lg:hidden">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            className="saas-card !shadow-[var(--pa-shadow-md)]"
            initial={false}
            animate={
              reduce || inView
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: 72, scale: 0.96 }
            }
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: reduce || !inView ? 0 : 0.1 + i * 0.12,
            }}
          >
            <CardFace card={card} playProgress={reduce || inView} />
          </motion.div>
        ))}
      </div>

      {/* Desktop stack */}
      <div
        ref={tiltRef}
        onMouseMove={reduce ? undefined : onMove}
        onMouseLeave={reduce ? undefined : onLeave}
        className="relative mx-auto hidden w-full max-w-[420px] aspect-[4/5] lg:block"
        style={{ perspective: 1100 }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pa-green)]/25 blur-3xl"
          aria-hidden
        />

        <motion.div
          className="relative h-full w-full"
          style={
            reduce
              ? undefined
              : { rotateX, rotateY, transformStyle: "preserve-3d" }
          }
        >
          {CARDS.map((card, i) => (
            <StackCard
              key={card.label}
              card={card}
              index={i}
              inView={inView}
              reduce={!!reduce}
              offsets={offsets[i]}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
