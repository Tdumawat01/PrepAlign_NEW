import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Soft ambient hero atmosphere — no busy constellation.
 * Two slow orbs + optional light scan. Respects reduced motion.
 */
export default function SignalField({ className = "" }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="signal-orb signal-orb-a" />
      <div className="signal-orb signal-orb-b" />
      {!reduce && <div className="signal-scan" />}
    </div>
  );
}
