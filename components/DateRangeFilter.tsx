"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { PiCalendarBlank } from "react-icons/pi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function parseISODate(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISODate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthCells(month: Date) {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatShort(iso: string) {
  const d = parseISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCompact(iso: string) {
  const d = parseISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function dayTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function DateSelectField({
  id,
  label,
  value,
  placeholder,
  active,
  onActivate,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      <button
        id={id}
        type="button"
        onClick={onActivate}
        className={cn(
          "flex h-10 w-full items-center gap-1.5 rounded-md border bg-white px-2.5 text-left text-sm shadow-none transition-colors",
          active
            ? "border-primary ring-2 ring-primary/20"
            : "border-input hover:bg-muted/30",
        )}
      >
        <PiCalendarBlank className="size-3.5 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-xs sm:text-sm",
            value ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {value ? formatShort(value) : placeholder}
        </span>
        <FiChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            active && "rotate-180 text-primary",
          )}
        />
      </button>
    </div>
  );
}

export default function DateRangeFilter({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(fromParam);
  const [to, setTo] = useState(toParam);
  const [picking, setPicking] = useState<"from" | "to">("from");
  const [cursor, setCursor] = useState(() =>
    startOfMonth(parseISODate(fromParam) ?? parseISODate(toParam) ?? new Date()),
  );

  useEffect(() => {
    setFrom(fromParam);
    setTo(toParam);
  }, [fromParam, toParam]);

  const label = useMemo(() => {
    if (fromParam && toParam) {
      return `${formatCompact(fromParam)} – ${formatCompact(toParam)}`;
    }
    if (fromParam) return `From ${formatCompact(fromParam)}`;
    if (toParam) return `Until ${formatCompact(toParam)}`;
    return "From – To";
  }, [fromParam, toParam]);

  const active = Boolean(fromParam || toParam);
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);
  const cells = useMemo(() => monthCells(cursor), [cursor]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function apply(nextFrom: string, nextTo: string, options?: { silent?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");
    if (nextTo) params.set("to", nextTo);
    else params.delete("to");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);

    if (options?.silent) return;

    if (!nextFrom && !nextTo) {
      toast.success("Filter cleared", {
        description: "Showing the default date range again.",
      });
      return;
    }

    const description =
      nextFrom && nextTo
        ? `${formatShort(nextFrom)} – ${formatShort(nextTo)}`
        : nextFrom
          ? `From ${formatShort(nextFrom)}`
          : `Until ${formatShort(nextTo)}`;

    toast.success("Filter applied", { description });
  }

  function clear() {
    setFrom("");
    setTo("");
    setPicking("from");
    apply("", "");
  }

  function activateField(field: "from" | "to") {
    setPicking(field);
    const anchor = field === "from" ? from : to;
    if (anchor) setCursor(startOfMonth(parseISODate(anchor) ?? new Date()));
  }

  function selectDay(day: Date) {
    const iso = toISODate(day);

    if (picking === "from") {
      setFrom(iso);
      if (to && iso > to) setTo("");
      setPicking("to");
      return;
    }

    if (from && iso < from) {
      setTo(from);
      setFrom(iso);
      return;
    }

    setTo(iso);
  }

  function isInRange(day: Date) {
    if (!fromDate || !toDate) return false;
    const t = dayTime(day);
    return t > dayTime(fromDate) && t < dayTime(toDate);
  }

  return (
    <div className={cn("flex min-w-0 max-w-full items-center gap-1", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setFrom(fromParam);
            setTo(toParam);
            setPicking(fromParam && !toParam ? "to" : "from");
            setCursor(
              startOfMonth(
                parseISODate(fromParam) ??
                  parseISODate(toParam) ??
                  new Date(),
              ),
            );
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 min-w-0 max-w-[42vw] justify-start gap-1.5 overflow-hidden px-2.5 font-normal shadow-none sm:max-w-[220px] sm:gap-2 sm:px-3",
              "whitespace-nowrap",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <PiCalendarBlank className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-left text-xs sm:text-sm">
              {label}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(300px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] space-y-3 overflow-hidden p-3"
          align="end"
          sideOffset={8}
          collisionPadding={12}
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Date range</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a start date, then an end date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DateSelectField
              id="date-range-from"
              label="From"
              value={from}
              placeholder="Start date"
              active={picking === "from"}
              onActivate={() => activateField("from")}
            />
            <DateSelectField
              id="date-range-to"
              label="To"
              value={to}
              placeholder="End date"
              active={picking === "to"}
              onActivate={() => activateField("to")}
            />
          </div>

          <div className="rounded-md border border-border bg-muted/20 p-2.5">
            <p className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
              Choosing{" "}
              <span className="text-foreground">
                {picking === "from" ? "start" : "end"}
              </span>{" "}
              date
            </p>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:bg-muted"
                onClick={() => setCursor((c) => addMonths(c, -1))}
                aria-label="Previous month"
              >
                <FiChevronLeft className="size-4" />
              </button>
              <p className="text-sm font-semibold">
                {cursor.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:bg-muted"
                onClick={() => setCursor((c) => addMonths(c, 1))}
                aria-label="Next month"
              >
                <FiChevronRight className="size-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {cells.map((day) => {
                const inMonth = day.getMonth() === cursor.getMonth();
                const isFrom = fromDate ? isSameDay(day, fromDate) : false;
                const isTo = toDate ? isSameDay(day, toDate) : false;
                const isEndpoint = isFrom || isTo;
                const inRange = isInRange(day);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={cn(
                      "flex aspect-square w-full max-w-9 items-center justify-center justify-self-center rounded-full text-sm font-medium transition-colors",
                      !inMonth && "text-muted-foreground/40",
                      inMonth &&
                        !isEndpoint &&
                        !inRange &&
                        "text-foreground hover:bg-muted",
                      isToday &&
                        !isEndpoint &&
                        !inRange &&
                        "bg-muted text-primary",
                      inRange && "rounded-none bg-primary/10 text-foreground",
                      isFrom && toDate && "rounded-r-none",
                      isTo && fromDate && "rounded-l-none",
                      isEndpoint &&
                        "bg-primary text-primary-foreground hover:bg-primary",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shadow-none"
              onClick={clear}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="shadow-none"
              onClick={() => apply(from, to)}
              disabled={Boolean(from && to && from > to)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {active ? (
        <button
          type="button"
          aria-label="Clear date range"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={clear}
        >
          <FiX className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
