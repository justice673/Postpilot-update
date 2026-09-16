"use client";

import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PiCalendarBlank } from "react-icons/pi";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
};

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

function formatDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePicker({
  value,
  onChange,
  disabled,
  id,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const selected = parseISODate(value);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() =>
    startOfMonth(selected ?? new Date()),
  );

  const cells = useMemo(() => monthCells(cursor), [cursor]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setCursor(startOfMonth(selected ?? new Date()));
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-start rounded-md px-3 font-normal shadow-none",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <PiCalendarBlank className="size-4 shrink-0 text-muted-foreground" />
          {selected ? formatDisplay(selected) : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[292px] p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
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
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
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

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const isSelected = selected ? isSameDay(day, selected) : false;
            const isToday = isSameDay(day, today);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  onChange(toISODate(day));
                  setOpen(false);
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  !inMonth && "text-muted-foreground/40",
                  inMonth && !isSelected && "text-foreground hover:bg-muted",
                  isToday && !isSelected && "bg-muted text-primary",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
