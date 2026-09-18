"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineMagnifyingGlass,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import AdminTablePagination, {
  paginateRows,
} from "@/components/admin/AdminTablePagination";
import ColumnHeaderMenu from "@/components/admin/ColumnHeaderMenu";
import { PlatformMark } from "@/components/dashboard/PlatformMark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { formatAdminDateTime, formatRelativeTime } from "@/lib/format";
import type {
  AdminActivityItem,
  AdminActivityType,
} from "@/lib/types/admin-activity";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | AdminActivityType;
type TimeFilter = "all" | "24h" | "7d" | "30d" | "this_month" | "3m" | "older";
type UserSort = "default" | "az" | "za";
type WhenSort = "newest" | "oldest";
type WhenMenuValue =
  | WhenSort
  | "24h"
  | "7d"
  | "30d"
  | "this_month"
  | "3m"
  | "older";

const typeMeta: Record<
  AdminActivityType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }
> = {
  signup: {
    label: "Signup",
    icon: HiOutlineUserPlus,
    tone: "bg-primary/10 text-primary",
  },
  scheduled: {
    label: "Scheduled",
    icon: HiOutlineCalendarDays,
    tone: "bg-amber-500/10 text-amber-700",
  },
  posted: {
    label: "Published",
    icon: HiOutlineCheckCircle,
    tone: "bg-emerald-500/10 text-emerald-700",
  },
  failed: {
    label: "Failed",
    icon: HiOutlineExclamationTriangle,
    tone: "bg-destructive/10 text-destructive",
  },
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function matchesTimeFilter(iso: string, filter: TimeFilter, now: Date) {
  if (filter === "all") return true;

  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;

  const ms = now.getTime() - time;
  const day = 24 * 60 * 60 * 1000;

  if (filter === "24h") return ms >= 0 && ms <= day;
  if (filter === "7d") return ms >= 0 && ms <= 7 * day;
  if (filter === "30d") return ms >= 0 && ms <= 30 * day;
  if (filter === "3m") return ms >= 0 && ms <= 90 * day;
  if (filter === "this_month") {
    const start = startOfMonth(now).getTime();
    return time >= start && time <= now.getTime();
  }
  if (filter === "older") return ms > 90 * day;
  return true;
}

export default function AdminNotificationsView({
  items,
  recentCount,
}: {
  items: AdminActivityItem[];
  recentCount: number;
}) {
  const range = useAdminDateRange();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [userSort, setUserSort] = useState<UserSort>("default");
  const [whenSort, setWhenSort] = useState<WhenSort>("newest");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<AdminActivityItem | null>(null);

  const now = useMemo(() => new Date(), []);

  const rangedItems = useMemo(
    () =>
      items.filter((item) =>
        isIsoInRange(item.occurredAt, range.from, range.to),
      ),
    [items, range.from, range.to],
  );

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rangedItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!matchesTimeFilter(item.occurredAt, timeFilter, now)) return false;
      if (!q) return true;
      return (
        item.userDisplayName.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.content?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    if (userSort === "az") {
      sorted.sort((a, b) =>
        a.userDisplayName.localeCompare(b.userDisplayName),
      );
    } else if (userSort === "za") {
      sorted.sort((a, b) =>
        b.userDisplayName.localeCompare(a.userDisplayName),
      );
    } else if (whenSort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      );
    }

    return sorted;
  }, [
    rangedItems,
    typeFilter,
    timeFilter,
    query,
    userSort,
    whenSort,
    now,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    range.from,
    range.to,
    pageSize,
    typeFilter,
    timeFilter,
    query,
    userSort,
    whenSort,
  ]);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / pageSize) || 1);
  const safePage = Math.min(page, pageCount);
  const pagedItems = useMemo(
    () => paginateRows(visibleItems, safePage, pageSize),
    [visibleItems, safePage, pageSize],
  );

  const filtersActive =
    typeFilter !== "all" ||
    timeFilter !== "all" ||
    userSort !== "default" ||
    whenSort !== "newest" ||
    query.trim().length > 0;

  function clearColumnSorts(keep: "user" | "when") {
    if (keep !== "user") setUserSort("default");
    if (keep !== "when") setWhenSort("newest");
  }

  const selectedMeta = selected ? typeMeta[selected.type] : null;
  const SelectedIcon = selectedMeta?.icon;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Activity
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          Notifications
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Live site events — new accounts, scheduled posts, publishes, and
          failures.
          {recentCount > 0
            ? ` ${recentCount} new in the last 24 hours.`
            : " Nothing new in the last 24 hours."}
        </p>
      </div>

      <Card className="max-w-full overflow-hidden shadow-none">
        <CardHeader className="gap-4 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>
                {visibleItems.length} event
                {visibleItems.length === 1 ? "" : "s"}
              </CardTitle>
              <CardDescription>
                Use column menus to filter by type and time
                {range.active ? " · limited by date range" : ""}
              </CardDescription>
            </div>
            {filtersActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground shadow-none"
                onClick={() => {
                  setTypeFilter("all");
                  setTimeFilter("all");
                  setUserSort("default");
                  setWhenSort("newest");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="relative max-w-md">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, or event…"
              className="h-10 pl-9 shadow-none"
              aria-label="Search notifications"
            />
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Event"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: "all", label: "All events" },
                      { value: "signup", label: "Signups" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "posted", label: "Published" },
                      { value: "failed", label: "Failed" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="User"
                    value={userSort}
                    onChange={(value) => {
                      clearColumnSorts("user");
                      setUserSort(value);
                    }}
                    options={[
                      { value: "default", label: "Default order" },
                      { value: "az", label: "Name A → Z" },
                      { value: "za", label: "Name Z → A" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4 font-medium text-muted-foreground">
                  Detail
                </th>
                <th className="py-3">
                  <ColumnHeaderMenu
                    label="When"
                    value={
                      (timeFilter !== "all"
                        ? timeFilter
                        : whenSort) as WhenMenuValue
                    }
                    onChange={(value: WhenMenuValue) => {
                      if (value === "newest" || value === "oldest") {
                        clearColumnSorts("when");
                        setWhenSort(value);
                        setTimeFilter("all");
                        return;
                      }
                      setTimeFilter(value);
                      setWhenSort("newest");
                      setUserSort("default");
                    }}
                    options={[
                      { value: "newest", label: "Newest first" },
                      { value: "oldest", label: "Oldest first" },
                      { value: "24h", label: "Last 24 hours" },
                      { value: "7d", label: "Last 7 days" },
                      { value: "30d", label: "Last 30 days" },
                      { value: "this_month", label: "This month" },
                      { value: "3m", label: "Last 3 months" },
                      { value: "older", label: "Older than 3 months" },
                    ]}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40"
                    onClick={() => setSelected(item)}
                  >
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            meta.tone,
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <span className="inline-flex items-center gap-2 font-medium text-foreground">
                          {item.platform ? (
                            <PlatformMark platform={item.platform} size="sm" />
                          ) : null}
                          {item.title}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="block min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {item.userDisplayName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.userEmail || "—"}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-md py-3 pr-4 text-muted-foreground">
                      <span className="line-clamp-2">{item.description}</span>
                    </td>
                    <td className="whitespace-nowrap py-3 text-muted-foreground">
                      {formatRelativeTime(item.occurredAt)}
                    </td>
                  </tr>
                );
              })}
              {pagedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {rangedItems.length === 0
                      ? "No activity yet. New signups and posts will show up here."
                      : "No events match these filters."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <AdminTablePagination
            total={visibleItems.length}
            page={safePage}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          {selected && selectedMeta && SelectedIcon ? (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
                      selectedMeta.tone,
                    )}
                  >
                    <SelectedIcon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="inline-flex items-center gap-2">
                      {selected.platform ? (
                        <PlatformMark platform={selected.platform} size="sm" />
                      ) : null}
                      {selected.title}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedMeta.label} ·{" "}
                      {formatRelativeTime(selected.occurredAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    User
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {selected.userDisplayName}
                  </p>
                  <p className="text-muted-foreground">
                    {selected.userEmail || "No email"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <p className="mt-1 text-foreground">{selected.description}</p>
                </div>

                {selected.content ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Full post
                    </p>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-white px-4 py-3 text-[15px] leading-relaxed text-foreground">
                      {selected.content}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Occurred
                    </p>
                    <p className="mt-1 text-foreground">
                      {formatAdminDateTime(selected.occurredAt)}
                    </p>
                  </div>
                  {selected.scheduledAt ? (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Scheduled for
                      </p>
                      <p className="mt-1 text-foreground">
                        {formatAdminDateTime(selected.scheduledAt)}
                      </p>
                    </div>
                  ) : null}
                  {selected.postedAt ? (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Published at
                      </p>
                      <p className="mt-1 text-foreground">
                        {formatAdminDateTime(selected.postedAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="shadow-none"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
                <Link
                  href={`/admin/users/${selected.userId}`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "shadow-none",
                  )}
                  onClick={() => setSelected(null)}
                >
                  View user
                </Link>
                {selected.type !== "signup" ? (
                  <Link
                    href="/admin/posts"
                    className={cn(buttonVariants(), "shadow-none")}
                    onClick={() => setSelected(null)}
                  >
                    View posts
                  </Link>
                ) : (
                  <Link
                    href={`/admin/users/${selected.userId}`}
                    className={cn(buttonVariants(), "shadow-none")}
                    onClick={() => setSelected(null)}
                  >
                    Open profile
                  </Link>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
