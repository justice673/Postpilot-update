"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiList } from "react-icons/fi";
import { GoPencil, GoTrash } from "react-icons/go";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IoCreateOutline } from "react-icons/io5";
import { PiCalendarBlank, PiCalendarDots } from "react-icons/pi";
import { SiX } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

type PostStatus = "pending" | "posted" | "failed";

type ScheduledPost = {
  id: string;
  content: string;
  scheduledAt: string;
  status: PostStatus;
  hasImage?: boolean;
};

type RangeMode = "week" | "month";
type ViewMode = "calendar" | "list";

const ease = [0.22, 1, 0.36, 1] as const;
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
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

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatMonthDayYear(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDayShort(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatListWhen(date: Date) {
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${formatTime(date)}`;
}

function toDateInput(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toTimeInput(date: Date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function monthGrid(month: Date) {
  const first = startOfMonth(month);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function seedPosts(): ScheduledPost[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "1",
      content:
        "Shipping the new compose flow this week — here’s what’s new for X creators.",
      scheduledAt: at(0, 9, 0),
      status: "pending",
    },
    {
      id: "2",
      content:
        "Most scheduling tools are calendars with lipstick. We built a queue.",
      scheduledAt: at(0, 13, 30),
      status: "pending",
      hasImage: true,
    },
    {
      id: "3",
      content: "Hot take on shipping in public — keep it sharp, under 280.",
      scheduledAt: at(0, 11, 15),
      status: "pending",
    },
    {
      id: "4",
      content:
        "Three wins, one miss, and what we’re shipping next Monday.",
      scheduledAt: at(1, 18, 0),
      status: "pending",
    },
    {
      id: "5",
      content: "Thread: how we cut draft time in half with Gemini prompts.",
      scheduledAt: at(2, 10, 0),
      status: "pending",
      hasImage: true,
    },
    {
      id: "6",
      content: "Posted yesterday — still picking up replies. Appreciate y’all.",
      scheduledAt: at(-1, 16, 20),
      status: "posted",
    },
    {
      id: "7",
      content: "Couldn’t publish — reconnect X and try again.",
      scheduledAt: at(-2, 12, 0),
      status: "failed",
    },
    {
      id: "8",
      content: "Friday wrap: ship notes + one meme for the timeline.",
      scheduledAt: at(4, 15, 45),
      status: "pending",
    },
    {
      id: "9",
      content: "Weekend drop: behind-the-scenes from the compose desk.",
      scheduledAt: at(6, 12, 0),
      status: "pending",
    },
    {
      id: "10",
      content: "Mid-month recap — what moved the needle on X.",
      scheduledAt: at(10, 9, 30),
      status: "pending",
    },
    {
      id: "11",
      content: "Launch teaser thread. Keep the first line sticky.",
      scheduledAt: at(14, 17, 0),
      status: "pending",
      hasImage: true,
    },
  ];
}

const statusBadge: Record<
  PostStatus,
  { label: string; variant: "warning" | "success" | "destructive" | "default" }
> = {
  pending: { label: "Scheduled", variant: "warning" },
  posted: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

export default function ScheduleView() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const rangeMenuRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>(seedPosts);
  const [range, setRange] = useState<RangeMode>("month");
  const [view, setView] = useState<ViewMode>("calendar");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [monthDir, setMonthDir] = useState(0);
  const [dropDayKey, setDropDayKey] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const daysInMonthGrid = useMemo(() => monthGrid(cursorMonth), [cursorMonth]);

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekDays[6].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const counts = useMemo(
    () => ({
      pending: posts.filter((p) => p.status === "pending").length,
      posted: posts.filter((p) => p.status === "posted").length,
      failed: posts.filter((p) => p.status === "failed").length,
    }),
    [posts],
  );

  const selectedPosts = useMemo(
    () =>
      posts
        .filter((p) => isSameDay(new Date(p.scheduledAt), selectedDay))
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
    [posts, selectedDay],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rangeMenuRef.current?.contains(e.target as Node)) {
        setRangeOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (selectedPosts.length === 0) {
      setActivePostId(null);
      return;
    }
    if (!activePostId || !selectedPosts.some((p) => p.id === activePostId)) {
      setActivePostId(selectedPosts[0].id);
    }
  }, [selectedPosts, activePostId]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || range !== "week") return;
    const todayIndex = weekDays.findIndex((day) => isSameDay(day, new Date()));
    if (todayIndex < 0) return;
    const card = carousel.children[todayIndex] as HTMLElement | undefined;
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [weekStart, weekDays, range]);

  function postsForDay(date: Date) {
    return posts
      .filter((p) => isSameDay(new Date(p.scheduledAt), date))
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }

  function flash(message: string) {
    setToast(message);
  }

  function openEdit(post: ScheduledPost) {
    setEditing(post);
    setEditOpen(true);
  }

  function handleDelete(id: string) {
    setPendingId(id);
    window.setTimeout(() => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setPendingId(null);
      if (editing?.id === id) {
        setEditOpen(false);
        setEditing(null);
      }
      flash("Post deleted");
    }, 280);
  }

  function handleSaveEdit(updated: ScheduledPost) {
    setPendingId(updated.id);
    window.setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      setPendingId(null);
      setEditOpen(false);
      setEditing(null);
      setSelectedDay(() => {
        const d = new Date(updated.scheduledAt);
        d.setHours(0, 0, 0, 0);
        return d;
      });
      flash("Post updated");
    }, 320);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("postId", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropDayKey(null);
  }

  function handleDrop(e: React.DragEvent, targetDate: Date) {
    e.preventDefault();
    setDropDayKey(null);
    setDraggingId(null);
    const id = e.dataTransfer.getData("postId");
    if (!id) return;

    const post = posts.find((p) => p.id === id);
    if (!post || post.status === "posted") return;

    const next = new Date(post.scheduledAt);
    next.setFullYear(targetDate.getFullYear());
    next.setMonth(targetDate.getMonth());
    next.setDate(targetDate.getDate());

    // No-op if dropped on the same day
    if (isSameDay(new Date(post.scheduledAt), targetDate)) return;

    setPendingId(id);
    window.setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, scheduledAt: next.toISOString() } : p,
        ),
      );
      setPendingId(null);
      selectDay(targetDate);
      setActivePostId(id);
      flash("Post rescheduled");
    }, 220);
  }

  function shiftWeek(direction: -1 | 1) {
    setWeekStart((current) => addDays(current, direction * 7));
  }

  function shiftMonth(direction: -1 | 1) {
    setMonthDir(direction);
    setCursorMonth((current) => addMonths(current, direction));
  }

  function selectDay(day: Date) {
    const next = new Date(day);
    next.setHours(0, 0, 0, 0);
    setSelectedDay(next);
    if (!isSameMonth(next, cursorMonth)) {
      setMonthDir(next > cursorMonth ? 1 : -1);
      setCursorMonth(startOfMonth(next));
    }
  }

  function scrollCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cardWidth = carousel.firstElementChild?.clientWidth ?? 0;
    carousel.scrollBy({
      left: direction * (cardWidth + 12),
      behavior: "smooth",
    });
  }

  const activePost =
    selectedPosts.find((p) => p.id === activePostId) ?? selectedPosts[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Queue
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
            Schedule
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Flip between week and month. Drag scheduled posts onto another day
            to reschedule — published posts stay locked.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className={cn(buttonVariants(), "rounded-md shadow-none")}
        >
          <IoCreateOutline className="size-4" />
          Create post
        </Link>
      </div>

      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
        >
          {toast}
        </motion.div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                view === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PiCalendarDots className="size-4" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FiList className="size-4" />
              List
            </button>
          </div>

          {view === "calendar" ? (
            <div ref={rangeMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {range === "month" ? (
                  <PiCalendarBlank className="size-4 text-primary" />
                ) : (
                  <PiCalendarDots className="size-4 text-primary" />
                )}
                {range === "month" ? "Month" : "Week"}
                <FiChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    rangeOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {rangeOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease }}
                    className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-[168px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-md"
                  >
                    {(
                      [
                        {
                          id: "month" as const,
                          label: "Month",
                          hint: "Full calendar",
                          Icon: PiCalendarBlank,
                        },
                        {
                          id: "week" as const,
                          label: "Week",
                          hint: "7-day board",
                          Icon: PiCalendarDots,
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRange(opt.id);
                          setRangeOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                          range === opt.id
                            ? "bg-[#eef4fc] text-primary"
                            : "hover:bg-[#f7faff]",
                        )}
                      >
                        <opt.Icon className="size-4 shrink-0" />
                        <span>
                          <span className="block text-sm font-semibold">
                            {opt.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {opt.hint}
                          </span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SiX className="size-3.5 text-foreground" />
          {counts.pending} scheduled · {counts.posted} published ·{" "}
          {counts.failed} failed
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
          >
            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
                  All posts
                </CardTitle>
                <CardDescription>
                  {counts.pending} scheduled · {counts.posted} published ·{" "}
                  {counts.failed} failed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No posts yet. Create one from the Create page.
                    </p>
                    <Link
                      href="/dashboard/create"
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "rounded-md shadow-none",
                      )}
                    >
                      Create post
                    </Link>
                  </div>
                ) : (
                  [...posts]
                    .sort(
                      (a, b) =>
                        new Date(a.scheduledAt).getTime() -
                        new Date(b.scheduledAt).getTime(),
                    )
                    .map((post) => (
                      <PostRow
                        key={post.id}
                        post={post}
                        disabled={pendingId === post.id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : range === "month" ? (
          <motion.div
            key="month"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              {/* Month calendar */}
              <div className="border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
                    aria-label="Previous month"
                  >
                    <FiChevronLeft className="size-4" />
                  </button>
                  <AnimatePresence mode="wait" custom={monthDir}>
                    <motion.p
                      key={formatMonthYear(cursorMonth)}
                      custom={monthDir}
                      initial={{ opacity: 0, x: monthDir * 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: monthDir * -16 }}
                      transition={{ duration: 0.22, ease }}
                      className="text-center text-base font-semibold tracking-tight sm:text-lg"
                    >
                      {formatMonthYear(cursorMonth)}
                    </motion.p>
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
                    aria-label="Next month"
                  >
                    <FiChevronRight className="size-4" />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait" custom={monthDir}>
                  <motion.div
                    key={formatMonthYear(cursorMonth)}
                    custom={monthDir}
                    initial={{ opacity: 0, x: monthDir * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: monthDir * -24 }}
                    transition={{ duration: 0.25, ease }}
                    className="grid grid-cols-7 gap-1.5 sm:gap-2"
                  >
                    {daysInMonthGrid.map((day) => {
                      const inMonth = isSameMonth(day, cursorMonth);
                      const selected = isSameDay(day, selectedDay);
                      const today = isSameDay(day, new Date());
                      const dayPosts = postsForDay(day);
                      const hasPosts = dayPosts.length > 0;
                      const dayKey = toDateInput(day);
                      const isDropTarget = dropDayKey === dayKey;

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() => selectDay(day)}
                          onDragOver={(e) => {
                            if (!draggingId) return;
                            e.preventDefault();
                            setDropDayKey(dayKey);
                          }}
                          onDragLeave={() => {
                            setDropDayKey((current) =>
                              current === dayKey ? null : current,
                            );
                          }}
                          onDrop={(e) => handleDrop(e, day)}
                          className={cn(
                            "relative mx-auto flex aspect-square w-full max-w-[48px] flex-col items-center justify-center rounded-full text-sm font-semibold transition-colors sm:max-w-none",
                            !inMonth && "text-muted-foreground/40",
                            inMonth &&
                              !selected &&
                              !isDropTarget &&
                              "text-foreground hover:bg-muted",
                            selected && "bg-primary text-primary-foreground",
                            today &&
                              !selected &&
                              !isDropTarget &&
                              "bg-muted text-primary",
                            isDropTarget &&
                              !selected &&
                              "bg-primary/15 text-primary ring-2 ring-primary/40",
                            isDropTarget &&
                              selected &&
                              "ring-2 ring-white/70",
                          )}
                        >
                          {day.getDate()}
                          {hasPosts ? (
                            <span
                              className={cn(
                                "absolute bottom-1.5 size-1 rounded-full",
                                selected ? "bg-white" : "bg-primary",
                              )}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Day agenda */}
              <div className="flex flex-col bg-muted/40 p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDay.toISOString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease }}
                    className="flex h-full flex-col"
                  >
                    <div className="mb-5">
                      <p className="font-[family-name:var(--pp-display)] text-2xl font-medium tracking-tight sm:text-3xl">
                        {formatWeekday(selectedDay)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMonthDayYear(selectedDay)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Drag a scheduled post onto a calendar day to move it.
                      </p>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      {selectedPosts.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
                          <p className="text-sm text-muted-foreground">
                            Nothing queued this day.
                          </p>
                          <Link
                            href="/dashboard/create"
                            className={cn(
                              buttonVariants(),
                              "mt-4 rounded-md shadow-none",
                            )}
                          >
                            Schedule a post
                          </Link>
                        </div>
                      ) : (
                        selectedPosts.map((post) => {
                          const active = activePost?.id === post.id;
                          const meta = statusBadge[post.status];
                          const canDrag = post.status !== "posted";
                          const isDragging = draggingId === post.id;

                          return (
                            <div
                              key={post.id}
                              className="flex items-stretch gap-2"
                            >
                              <button
                                type="button"
                                draggable={canDrag}
                                onDragStart={(e) => {
                                  if (!canDrag) {
                                    e.preventDefault();
                                    return;
                                  }
                                  handleDragStart(e, post.id);
                                }}
                                onDragEnd={handleDragEnd}
                                onClick={() => setActivePostId(post.id)}
                                className={cn(
                                  "min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                                  canDrag
                                    ? "cursor-grab active:cursor-grabbing"
                                    : "cursor-default opacity-80",
                                  isDragging && "opacity-50",
                                  pendingId === post.id && "animate-pulse",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:bg-muted/70",
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold">
                                    {formatTime(new Date(post.scheduledAt))}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                      active
                                        ? "bg-white/20 text-white"
                                        : meta.variant === "success"
                                          ? "bg-emerald-500/15 text-emerald-700"
                                          : meta.variant === "warning"
                                            ? "bg-amber-500/15 text-amber-700"
                                            : "bg-red-500/10 text-red-600",
                                    )}
                                  >
                                    {meta.label}
                                  </span>
                                </div>
                                <p
                                  className={cn(
                                    "mt-1.5 line-clamp-2 text-xs leading-relaxed",
                                    active
                                      ? "text-primary-foreground/85"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {post.content}
                                </p>
                              </button>
                              {active ? (
                                <motion.button
                                  type="button"
                                  layout
                                  initial={{ opacity: 0, scale: 0.96 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => openEdit(post)}
                                  className="shrink-0 self-center rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
                                >
                                  Edit
                                </motion.button>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {selectedPosts.length > 0 ? (
                      <Link
                        href="/dashboard/create"
                        className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-[#1e4f9a]"
                      >
                        <IoCreateOutline className="size-4" />
                        Add another for this day
                      </Link>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shadow-none"
                onClick={() => shiftWeek(-1)}
                aria-label="Previous week"
              >
                <FiChevronLeft className="size-4" />
              </Button>
              <p className="text-center text-sm font-semibold sm:text-base">
                {weekLabel}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shadow-none"
                onClick={() => shiftWeek(1)}
                aria-label="Next week"
              >
                <FiChevronRight className="size-4" />
              </Button>
            </div>

            <div className="space-y-3 lg:hidden">
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCarousel(-1)}
                  aria-label="Previous day"
                >
                  <FiChevronLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Swipe days · tap post to edit
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCarousel(1)}
                  aria-label="Next day"
                >
                  <FiChevronRight className="size-4" />
                </Button>
              </div>
              <div
                ref={carouselRef}
                className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
              >
                {weekDays.map((day) => (
                  <DayColumn
                    key={day.toISOString()}
                    day={day}
                    posts={postsForDay(day)}
                    pendingId={pendingId}
                    variant="mobile"
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={openEdit}
                    onSelectDay={selectDay}
                    selected={isSameDay(day, selectedDay)}
                  />
                ))}
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-border bg-card p-2 lg:grid lg:grid-cols-7 lg:gap-2">
              {weekDays.map((day) => (
                <DayColumn
                  key={day.toISOString()}
                  day={day}
                  posts={postsForDay(day)}
                  pendingId={pendingId}
                  variant="desktop"
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={openEdit}
                  onSelectDay={selectDay}
                  selected={isSameDay(day, selectedDay)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditPostSheet
        post={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        saving={pendingId === editing?.id}
      />
    </div>
  );
}

function DayColumn({
  day,
  posts,
  pendingId,
  variant,
  onDrop,
  onDragStart,
  onDragEnd,
  onEdit,
  onSelectDay,
  selected,
}: {
  day: Date;
  posts: ScheduledPost[];
  pendingId: string | null;
  variant: "mobile" | "desktop";
  onDrop: (e: React.DragEvent, targetDate: Date) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  onEdit: (post: ScheduledPost) => void;
  onSelectDay: (day: Date) => void;
  selected: boolean;
}) {
  const isToday = isSameDay(day, new Date());
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        isMobile ? "w-[88vw] max-w-md shrink-0 snap-center p-4" : "min-h-[160px] p-2",
        selected || isToday
          ? "border-primary/30 bg-primary/[0.05]"
          : "border-transparent bg-muted/50",
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, day)}
      onClick={() => onSelectDay(day)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={cn(
              "font-semibold",
              selected || isToday
                ? "text-primary"
                : isMobile
                  ? "text-foreground"
                  : "text-muted-foreground",
              isMobile ? "text-base" : "text-xs font-medium",
            )}
          >
            {isMobile ? formatWeekday(day) : formatDayShort(day)}
          </p>
          {isMobile ? (
            <p
              className={cn(
                "text-sm",
                selected || isToday ? "text-primary/80" : "text-muted-foreground",
              )}
            >
              {formatMonthDayYear(day)}
            </p>
          ) : null}
        </div>
        <Badge
          variant={posts.length > 0 ? "secondary" : "outline"}
        >
          {posts.length}
        </Badge>
      </div>

      <div className={cn("space-y-2", isMobile ? "mt-4" : "mt-2")}>
        {posts.length === 0 ? (
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "py-6 text-center text-sm" : "text-[10px]",
            )}
          >
            Free
          </p>
        ) : (
          posts.map((post) => {
            const meta = statusBadge[post.status];
            return (
              <button
                key={post.id}
                type="button"
                draggable={!isMobile && post.status !== "posted"}
                onDragStart={(e) => onDragStart(e, post.id)}
                onDragEnd={onDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className={cn(
                  "w-full rounded-lg bg-card text-left ring-1 ring-border transition hover:bg-muted/70",
                  isMobile ? "p-3" : "px-1.5 py-1.5",
                  post.status !== "posted" && !isMobile
                    ? "cursor-grab active:cursor-grabbing"
                    : "",
                  pendingId === post.id ? "animate-pulse" : "",
                  post.status === "posted" ? "opacity-65" : "",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "font-medium text-muted-foreground",
                      isMobile ? "text-xs" : "text-[10px]",
                    )}
                  >
                    {formatTime(new Date(post.scheduledAt))}
                  </span>
                  <Badge
                    variant={
                      meta.variant === "destructive" ? "outline" : meta.variant
                    }
                    className={cn(
                      !isMobile && "scale-90",
                      meta.variant === "destructive" &&
                        "border-red-500 text-red-600",
                    )}
                  >
                    {meta.label}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "mt-1 line-clamp-2 leading-snug",
                    isMobile ? "text-sm text-foreground" : "text-[10px]",
                  )}
                >
                  {post.content}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function PostRow({
  post,
  disabled,
  onEdit,
  onDelete,
}: {
  post: ScheduledPost;
  disabled?: boolean;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
}) {
  const meta = statusBadge[post.status];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-4">
      <HiOutlineBars3 className="mt-1 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm">{post.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant={meta.variant === "destructive" ? "outline" : meta.variant}
            className={cn(
              meta.variant === "destructive" &&
                "border-red-500 text-red-600",
            )}
          >
            {meta.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatListWhen(new Date(post.scheduledAt))}
          </span>
          {post.hasImage ? (
            <Badge variant="secondary" className="rounded-md">
              + image
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={disabled}
          onClick={() => onEdit(post)}
          aria-label="Edit post"
        >
          <GoPencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={disabled}
          onClick={() => onDelete(post.id)}
          aria-label="Delete post"
        >
          <GoTrash className="size-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function EditPostSheet({
  post,
  open,
  onOpenChange,
  onSave,
  onDelete,
  saving,
}: {
  post: ScheduledPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ScheduledPost) => void;
  onDelete: (id: string) => void;
  saving?: boolean;
}) {
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<PostStatus>("pending");

  useEffect(() => {
    if (!post) return;
    const scheduled = new Date(post.scheduledAt);
    setContent(post.content);
    setDate(toDateInput(scheduled));
    setTime(toTimeInput(scheduled));
    setStatus(post.status);
  }, [post]);

  const isReadOnly = post?.status === "posted";

  function handleSave() {
    if (!post || !content.trim()) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSave({
      ...post,
      content: content.trim(),
      scheduledAt,
      status,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--pp-display)] text-2xl font-medium">
            Edit post
          </SheetTitle>
          <SheetDescription>
            {isReadOnly
              ? "This post was already published. Content is read-only."
              : "Update the copy or move it on the calendar."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              disabled={isReadOnly}
              className="resize-none shadow-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {content.length}/280
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <DatePicker
                id="edit-date"
                value={date}
                onChange={setDate}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <TimePicker
                id="edit-time"
                value={time}
                onChange={setTime}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              disabled={isReadOnly}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending">Scheduled</option>
              <option value="posted">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:flex-row sm:justify-between">
          {post && !isReadOnly ? (
            <Button
              type="button"
              variant="ghost"
              className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={saving}
              onClick={() => onDelete(post.id)}
            >
              <GoTrash className="size-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {!isReadOnly ? (
              <Button
                type="button"
                className="shadow-none"
                disabled={saving || !content.trim()}
                onClick={handleSave}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            ) : null}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
