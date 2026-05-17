import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/**
 * AnimatedNumber — counts from 0 to `value` when it scrolls into view.
 *
 * Props:
 *   value: number  (the target number)
 *   suffix: string (e.g. "+", "%", "k+")
 *   prefix: string (e.g. "$")
 *   duration: seconds (default 1.6)
 *   format: (n) => string (custom formatter; defaults to Math.round + en-US locale)
 */
export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
  format,
  className,
  testid,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [inView, value, duration]);

  const formatted = format
    ? format(display)
    : Math.round(display).toLocaleString("en-US");

  return (
    <span ref={ref} className={className} data-testid={testid}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
