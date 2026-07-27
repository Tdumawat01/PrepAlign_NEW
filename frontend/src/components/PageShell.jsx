import React from "react";

/**
 * Shared page shell — identical horizontal gutter + max width on every page.
 * Keeps mobile/desktop alignment in sync with the navbar (max-w-6xl).
 */
export default function PageShell({
  children,
  className = "",
  y = true,
  narrow = false,
  center = false,
  as: Tag = "div",
  testId,
}) {
  return (
    <Tag
      className={[
        "apple-page",
        y ? "apple-page-y" : "",
        narrow ? "apple-page-narrow" : "",
        center ? "text-center" : "text-left",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
    >
      {children}
    </Tag>
  );
}
