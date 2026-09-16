"use client";

import { useMemo, useState } from "react";
import { GoClock } from "react-icons/go";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

type Period = "AM" | "PM";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
};

function parseTime24(value: string) {
  const [hRaw, mRaw] = (value || "12:00").split(":").map(Number);
  const hours24 = Number.isFinite(hRaw) ? hRaw : 12;
  const minute = Number.isFinite(mRaw) ? mRaw : 0;
  const period: Period = hours24 >= 12 ? "PM" : "AM";
  let hour12 = hours24 % 12;
  if (hour12 === 0) hour12 = 12;
  const snappedMinute = MINUTES.reduce((prev, curr) =>
    Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev,
  );
  return { hour12, minute: snappedMinute, period };
}

function toTime24(hour12: number, minute: number, period: Period) {
  let hours24 = hour12 % 12;
  if (period === "PM") hours24 += 12;
  return `${String(hours24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplay(value: string) {
  const { hour12, minute, period } = parseTime24(value);
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function TimeColumn({
  label,
  options,
  value,
  onChange,
  format = (n) => String(n),
}: {
  label: string;
  options: number[] | Period[];
  value: number | Period;
  onChange: (value: number | Period) => void;
  format?: (n: number | Period) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex h-44 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-1">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card",
              )}
            >
              {typeof opt === "number" ? format(opt) : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  disabled,
  id,
  placeholder = "Pick a time",
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => parseTime24(value || "12:00"), [value]);

  function update(
    next: Partial<{ hour12: number; minute: number; period: Period }>,
  ) {
    onChange(
      toTime24(
        next.hour12 ?? parsed.hour12,
        next.minute ?? parsed.minute,
        next.period ?? parsed.period,
      ),
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-md px-3 font-normal shadow-none",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <GoClock className="size-4 shrink-0 text-muted-foreground" />
          {value ? formatDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-end gap-2">
          <TimeColumn
            label="Hour"
            options={HOURS}
            value={parsed.hour12}
            onChange={(v) => update({ hour12: v as number })}
          />
          <TimeColumn
            label="Min"
            options={MINUTES}
            value={parsed.minute}
            format={(n) => String(n).padStart(2, "0")}
            onChange={(v) => update({ minute: v as number })}
          />
          <TimeColumn
            label="Period"
            options={["AM", "PM"]}
            value={parsed.period}
            onChange={(v) => update({ period: v as Period })}
          />
        </div>
        <Button
          type="button"
          className="mt-3 w-full rounded-md shadow-none"
          onClick={() => setOpen(false)}
        >
          Done
        </Button>
      </PopoverContent>
    </Popover>
  );
}
