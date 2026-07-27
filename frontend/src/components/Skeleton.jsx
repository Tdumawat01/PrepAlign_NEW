import React from "react";

/** Soft shimmer placeholders (awesome-react-components → content-loader pattern, CSS-only). */
export function Skeleton({ className = "", style }) {
  return <div className={`apple-skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function JobListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4 py-6" data-testid="jobs-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-start py-4 border-t border-neutral-200/80">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
          <Skeleton className="h-9 w-20 rounded-full shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}
