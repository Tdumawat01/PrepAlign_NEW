import React from "react";
import { Reveal } from "./Reveal";

/**
 * Shared left-aligned page hero. Use align="center" only for intentional centered moments (e.g. success states).
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "left",
  children,
  className = "",
  band = false,
  testId,
  maxWidth = "max-w-6xl",
}) {
  const isCenter = align === "center";
  return (
    <section className={`${band ? "apple-band" : ""} ${className}`}>
      <div
        className={`apple-page apple-page-y ${isCenter ? "text-center" : "text-left"}`}
        data-testid={testId}
      >
        <Reveal>
          {eyebrow ? <p className="apple-eyebrow mb-4">{eyebrow}</p> : null}
          <h1 className={`apple-headline ${isCenter ? "mx-auto" : ""}`}>{title}</h1>
          {subtitle ? (
            <p className={`apple-subhead mt-5 ${isCenter ? "apple-subhead-center" : ""}`}>
              {subtitle}
            </p>
          ) : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
