import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Infinite horizontal marquee. Duplicates children for a seamless loop.
 */
export default function Marquee({
  children,
  speed = 35,
  className = "",
  pauseOnHover = true,
}) {
  const reduce = useReducedMotion();
  const items = React.Children.toArray(children);

  if (reduce) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
        {items}
      </div>
    );
  }

  return (
    <div
      className={`marquee-track group overflow-hidden ${className}`}
      data-testid="marquee"
    >
      <div
        className={`marquee-inner flex w-max gap-10 ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-10 px-4">{items}</div>
        <div className="flex shrink-0 items-center gap-10 px-4" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}
