"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export type AdminDateRange = {
  from: string;
  to: string;
  active: boolean;
};

/** Inclusive calendar-day check against an ISO timestamp. */
export function isIsoInRange(iso: string, from: string, to: string) {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function useAdminDateRange(): AdminDateRange {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  return useMemo(
    () => ({
      from,
      to,
      active: Boolean(from || to),
    }),
    [from, to],
  );
}

export function formatRangeLabel(from: string, to: string) {
  if (from && to) return `${from} → ${to}`;
  if (from) return `From ${from}`;
  if (to) return `Until ${to}`;
  return null;
}
