"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

export type AdminTablePaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Optional selection count for data-table style copy. */
  selectedCount?: number;
  className?: string;
};

export default function AdminTablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedCount,
  className,
}: AdminTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const canPrev = safePage > 1;
  const canNext = safePage < pageCount;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border px-1 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex-1 text-sm text-muted-foreground">
        {typeof selectedCount === "number"
          ? `${selectedCount} of ${total} row(s) selected.`
          : total === 0
            ? "0 row(s)."
            : `${Math.min((safePage - 1) * pageSize + 1, total)}–${Math.min(safePage * pageSize, total)} of ${total} row(s).`}
      </p>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="admin-rows-per-page"
            className="whitespace-nowrap text-sm font-medium"
          >
            Rows per page
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="admin-rows-per-page"
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-w-[4.5rem] justify-between gap-1.5 px-2.5 font-medium tabular-nums shadow-none"
              >
                {pageSize}
                <ChevronsUpDown className="size-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[4.5rem] p-1">
              {PAGE_SIZE_OPTIONS.map((size) => {
                const selected = size === pageSize;
                return (
                  <DropdownMenuItem
                    key={size}
                    className={cn(
                      "cursor-pointer justify-between gap-3 rounded-md px-2.5 py-1.5 tabular-nums",
                      selected && "bg-primary/10 font-semibold text-primary",
                    )}
                    onSelect={() => {
                      onPageSizeChange(size);
                      onPageChange(1);
                    }}
                  >
                    {size}
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
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium tabular-nums">
          Page {safePage} of {pageCount}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden size-8 shadow-none lg:flex"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shadow-none"
            onClick={() => onPageChange(safePage - 1)}
            disabled={!canPrev}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shadow-none"
            onClick={() => onPageChange(safePage + 1)}
            disabled={!canNext}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden size-8 shadow-none lg:flex"
            onClick={() => onPageChange(pageCount)}
            disabled={!canNext}
            aria-label="Go to last page"
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (Math.max(page, 1) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
