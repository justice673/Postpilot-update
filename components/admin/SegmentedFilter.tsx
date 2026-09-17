"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedFilterItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export default function SegmentedFilter<T extends string>({
  items,
  value,
  onChange,
  layoutId = "segmented-filter-pill",
  className,
}: {
  items: SegmentedFilterItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Unique per page if multiple filters mount together. */
  layoutId?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter"
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-full border border-primary/15 bg-primary/8 p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative z-0 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                  mass: 0.7,
                }}
              />
            ) : null}
            <span className="relative z-10">{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "relative z-10 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums leading-none",
                  active
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-primary/12 text-primary",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
