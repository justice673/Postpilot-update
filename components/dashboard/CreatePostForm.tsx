"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FiHeart,
  FiMessageCircle,
  FiRepeat,
  FiShare,
  FiX,
} from "react-icons/fi";
import { GoClock } from "react-icons/go";
import { HiOutlinePhoto, HiOutlineSparkles } from "react-icons/hi2";
import { IoCreateOutline } from "react-icons/io5";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

const AI_SAMPLES = [
  "Hot take: the best marketing is a product that ships weekly and talks about it in public.",
  "Three things we learned shipping Postpilot this month — and the one mistake we’ll never repeat.",
  "If your content calendar lives in five tabs, you don’t have a workflow. You have a scavenger hunt.",
];

type Mode = "write" | "prompt";

type LocalImage = {
  id: string;
  url: string;
  name: string;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreatePostForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("write");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("14:00");
  const [expanding, setExpanding] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const charsLeft = MAX_CHARS - content.length;
  const overLimit = charsLeft < 0;

  const previewText = useMemo(() => {
    if (content.trim()) return content;
    if (mode === "prompt" && prompt.trim()) {
      return "Your AI draft will land here after you expand…";
    }
    return "Your post will appear here…";
  }, [content, mode, prompt]);

  function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const next = Array.from(files)
      .slice(0, remaining)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
    setImages((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
  }

  async function handleExpand() {
    if (!prompt.trim()) {
      setError("Add a prompt first.");
      return;
    }
    setExpanding(true);
    setError(null);
    setMessage(null);
    await new Promise((r) => setTimeout(r, 700));
    const pick = AI_SAMPLES[Math.floor(Math.random() * AI_SAMPLES.length)];
    setContent(pick);
    setMode("write");
    setExpanding(false);
    setMessage("Draft expanded with AI — edit freely, then schedule.");
  }

  async function handleSchedule() {
    if (!content.trim()) {
      setError("Write a post (or expand a prompt) before scheduling.");
      return;
    }
    if (overLimit) {
      setError("X posts must be 280 characters or fewer.");
      return;
    }
    setScheduling(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 800));
    setScheduling(false);
    setMessage(`Queued for ${date} at ${time} on X.`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Create
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.35rem] sm:leading-none">
            Compose for X
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Write it yourself or drop a prompt for Gemini. Preview, attach up to
            four images, then schedule.
          </p>
        </div>
        <Badge className="w-fit rounded-md bg-primary/10 text-primary hover:bg-primary/10">
          <SiX className="mr-1.5 size-3" />
          X connected
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "write", label: "Write post", icon: IoCreateOutline },
                  {
                    id: "prompt",
                    label: "Drop a prompt",
                    icon: HiOutlineSparkles,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    mode === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div>
              <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
                {mode === "write" ? "Your draft" : "Prompt for Gemini"}
              </CardTitle>
              <CardDescription className="mt-1">
                {mode === "write"
                  ? "Keep it under 280 characters. Edit until it sounds like you."
                  : "Describe the idea — we’ll expand it into a post you can tweak."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {mode === "write" ? (
              <div className="space-y-2">
                <Label htmlFor="post-content">Post</Label>
                <Textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What’s happening?"
                  className="min-h-[180px] resize-y text-[15px] leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {images.length}/4 images
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      overLimit ? "text-destructive" : "text-muted-foreground",
                      charsLeft <= 20 && !overLimit && "text-primary",
                    )}
                  >
                    {charsLeft} left
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Launch thread about our new schedule calendar"
                    className="min-h-[140px] resize-y text-[15px] leading-relaxed"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleExpand}
                  disabled={expanding}
                  className="rounded-md shadow-none"
                >
                  <HiOutlineSparkles className="size-4" />
                  {expanding ? "Expanding…" : "Expand with AI"}
                </Button>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Images</p>
                  <p className="text-xs text-muted-foreground">
                    Up to 4 uploads. AI image gen coming soon.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md shadow-none"
                  disabled={images.length >= MAX_IMAGES}
                  onClick={() => fileRef.current?.click()}
                >
                  <HiOutlinePhoto className="size-4" />
                  Add images
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${img.name}`}
                        onClick={() => removeImage(img.id)}
                        className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <FiX className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date</Label>
                <DatePicker
                  id="schedule-date"
                  value={date}
                  onChange={setDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <TimePicker
                  id="schedule-time"
                  value={time}
                  onChange={setTime}
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                onClick={handleSchedule}
                disabled={scheduling}
                className="rounded-md shadow-none"
              >
                <GoClock className="size-4" />
                {scheduling ? "Scheduling…" : "Schedule post"}
              </Button>
              <Link
                href="/dashboard/schedule"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-md shadow-none",
                )}
              >
                Open schedule
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="border-border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
                Preview
              </CardTitle>
              <CardDescription>How this lands on X</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    J
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="font-semibold text-foreground">
                        Justice
                      </span>
                      <span className="text-sm text-muted-foreground">
                        @justice
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                      {previewText}
                    </p>
                    {images.length > 0 ? (
                      <div
                        className={cn(
                          "mt-3 grid gap-0.5 overflow-hidden rounded-xl border border-border",
                          images.length === 1 ? "grid-cols-1" : "grid-cols-2",
                        )}
                      >
                        {images.slice(0, 4).map((img, index) => (
                          <div
                            key={img.id}
                            className={cn(
                              "relative overflow-hidden bg-muted",
                              images.length === 1
                                ? "aspect-video"
                                : "aspect-square",
                              images.length === 3 && index === 0 && "row-span-2",
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4 flex justify-between text-muted-foreground">
                      <FiMessageCircle className="size-4" />
                      <FiRepeat className="size-4" />
                      <FiHeart className="size-4" />
                      <FiShare className="size-4" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-right text-xs text-muted-foreground">
                {Math.max(content.length, 0)}/{MAX_CHARS}
                {images.length > 0 ? ` · ${images.length}/4 images` : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/40 shadow-none">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-semibold text-foreground">
                Tip
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Schedule for peak hours, or post now from the queue later.
                Instagram and LinkedIn publishing are coming next.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
