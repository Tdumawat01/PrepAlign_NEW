import React from "react";
import { motion } from "framer-motion";

/**
 * Reveal — fade + lift on scroll-into-view. One-shot.
 * Usage: <Reveal delay={0.1}>...</Reveal>
 */
export function Reveal({ children, delay = 0, y = 16, className, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger — animates children sequentially when parent enters viewport.
 * Each direct child should be wrapped in <StaggerItem>.
 */
export function Stagger({ children, className, delayChildren = 0, stagger = 0.08, ...rest }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 14, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      variants={{
        hidden: { opacity: 0, y },
        show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
