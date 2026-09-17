"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ColumnMenuOption<T extends string> = {
  value: T;
  label: string;
};

export default function ColumnHeaderMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  align = "start",
  className,
}: {
  label: string;
  value: T;
  options: ColumnMenuOption<T>[];
  onChange: (value: T) => void;
  align?: "start" | "end" | "center";
  className?: string;
}) {
  const active = value !== options[0]?.value;
  const activeLabel =
    options.find((option) => option.value === value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=open]:bg-muted/60 data-[state=open]:text-foreground",
            active && "text-primary data-[state=open]:text-primary",
            className,
          )}
          title={active ? `${label}: ${activeLabel}` : label}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown
            className={cn(
              "size-3.5 shrink-0 opacity-45 transition-opacity group-hover:opacity-80",
              active && "opacity-100 text-primary",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[11rem] p-1">
        <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                "cursor-pointer justify-between gap-3 rounded-md px-2.5 py-1.5",
                selected && "bg-primary/10 font-medium text-primary",
              )}
              onSelect={() => onChange(option.value)}
            >
              {option.label}
              <Check
                className={cn(
                  "size-3.5 text-primary",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
