import React from "react";
import { useReducedMotion } from "framer-motion";

/** Small live signal indicator for intelligence sections. */
export default function LivePulse({ label = "Live signals", className = "" }) {
  const reduce = useReducedMotion();

  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {!reduce && (
          <span className="live-pulse-ring absolute inline-flex h-full w-full rounded-full bg-pa-interactive opacity-75" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-pa-interactive" />
      </span>
      {label}
    </span>
  );
}
