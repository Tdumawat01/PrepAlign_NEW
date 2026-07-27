import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Cycles words with a vertical swap. Width animates to fit the active word
 * so highlight backgrounds hug each role tightly.
 */
export default function TextCycle({
  words,
  intervalMs = 2400,
  className = "",
  ...rest
}) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(undefined);
  const measureRef = useRef(null);
  const reduce = useReducedMotion();
  const list = useMemo(
    () => (words?.length ? words : [""]),
    [words],
  );
  const current = list[index] ?? "";

  useEffect(() => {
    if (reduce || list.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [list, intervalMs, reduce]);

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    setWidth(measureRef.current.offsetWidth);
  }, [current, className, list]);

  if (reduce) {
    return <span className={className} {...rest}>{list[0]}</span>;
  }

  return (
    <motion.span
      className={`relative inline-flex overflow-hidden align-baseline ${className}`}
      animate={width != null ? { width } : undefined}
      initial={false}
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.5 }}
      style={width != null ? { width } : undefined}
      {...rest}
    >
      {/* Off-screen measure of active word WITH same padding/classes */}
      <span
        ref={measureRef}
        className={`invisible absolute pointer-events-none whitespace-nowrap ${className}`}
        aria-hidden
      >
        {current}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          className="inline-block whitespace-nowrap"
          initial={{ y: "105%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-105%", opacity: 0, position: "absolute", left: 0, right: 0, top: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.55 }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
