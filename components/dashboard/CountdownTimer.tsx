"use client";

import { useEffect, useState } from "react";

function formatRemaining(diffMs: number) {
  if (diffMs <= 0) return "Now";
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

export default function CountdownTimer({
  targetDate,
  className,
}: {
  targetDate: string;
  className?: string;
}) {
  const [remaining, setRemaining] = useState(() =>
    formatRemaining(new Date(targetDate).getTime() - Date.now()),
  );

  useEffect(() => {
    function tick() {
      setRemaining(
        formatRemaining(new Date(targetDate).getTime() - Date.now()),
      );
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  return (
    <span className={className ?? "font-mono tabular-nums"}>{remaining}</span>
  );
}
