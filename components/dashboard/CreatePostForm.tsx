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
import { FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import type { PostPlatform } from "@/lib/types/posts";
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
import {
  createPostAction,
  expandPromptAction,
} from "@/app/dashboard/create/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  resolveUserTimeZone,
  todayKeyInZone,
} from "@/lib/timezone";
import { DEFAULT_TIMEZONE } from "@/lib/types/profile";

const PLATFORM_LIMITS: Record<
  PostPlatform,
  { maxChars: number; maxImages: number; label: string }
> = {
  x: { maxChars: 280, maxImages: 4, label: "X" },
  linkedin: { maxChars: 3000, maxImages: 9, label: "LinkedIn" },
};

type Mode = "write" | "prompt";

type LocalImage = {
  id: string;
  url: string;
  name: string;
  file?: File;
};

export default function CreatePostForm({
  xConnected = false,
  xUsername = null,
  linkedinConnected = false,
  linkedinUsername = null,
  initialDate,
  timeZone,
  platformAiEnabled = true,
}: {
  xConnected?: boolean;
  xUsername?: string | null;
  linkedinConnected?: boolean;
  linkedinUsername?: string | null;
  initialDate?: string | null;
  timeZone?: string | null;
  platformAiEnabled?: boolean;
}) {
  const router = useRouter();
  const userTimeZone = resolveUserTimeZone(
    timeZone && timeZone !== DEFAULT_TIMEZONE ? timeZone : null,
  );
  const minDate = todayKeyInZone(userTimeZone);
  const fileRef = useRef<HTMLInputElement>(null);
  const [platform, setPlatform] = useState<PostPlatform>(
    xConnected ? "x" : linkedinConnected ? "linkedin" : "x",
  );
  const [mode, setMode] = useState<Mode>("write");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [date, setDate] = useState(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      return initialDate < minDate ? minDate : initialDate;
    }
    return minDate;
  });
  const [time, setTime] = useState("14:00");
  const [expanding, setExpanding] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limits = PLATFORM_LIMITS[platform];
  const maxChars = limits.maxChars;
  const maxImages = limits.maxImages;
  const platformConnected =
    platform === "x" ? xConnected : linkedinConnected;
  const platformHandle =
    platform === "x"
      ? xUsername
        ? `@${xUsername}`
        : null
      : linkedinUsername || null;
  const charsLeft = maxChars - content.length;
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
    const remaining = maxImages - images.length;
    const next = Array.from(files)
      .slice(0, remaining)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: URL.createObjectURL(file),
        name: file.name,
        file,
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

  async function resolveImageUrls(): Promise<string[]> {
    const remoteUrls = images
      .filter((img) => img.url.startsWith("http"))
      .map((img) => img.url);
    const filesToUpload = images
      .filter((img) => img.file)
      .map((img) => img.file!);
    if (filesToUpload.length === 0) return remoteUrls;

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/upload-post-images", {
      method: "POST",
      body: formData,
    });
    const uploadResult = (await response.json()) as
      | { success: true; data: string[] }
      | { success: false; error: string };

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    return [...remoteUrls, ...uploadResult.data];
  }

  async function handleExpand() {
    if (!prompt.trim()) {
      setError("Add a prompt first.");
      return;
    }
    setExpanding(true);
    setError(null);
    setMessage(null);

    const result = await expandPromptAction(prompt);
    if (!result.success) {
      setError(result.error);
      toast.error("Couldn’t expand prompt", { description: result.error });
      setExpanding(false);
      return;
    }

    setContent(result.data);
    setMode("write");
    setExpanding(false);
    setMessage("Draft expanded with AI — edit freely, then schedule.");
    toast.success("Draft expanded", {
      description: "Edit freely, then schedule when you’re ready.",
    });
  }

  async function handleSchedule() {
    if (!platformConnected) {
      setError(`Connect your ${limits.label} account before scheduling.`);
      toast.error(`Connect ${limits.label} first`, {
        description: `Link your ${limits.label} account before scheduling a post.`,
      });
      return;
    }

    setError(null);
    setMessage(null);

    let finalContent = content.trim();

    if (mode === "prompt" && !finalContent) {
      if (!prompt.trim()) {
        setError("Write something or drop a prompt first.");
        return;
      }
      setScheduling(true);
      const expandResult = await expandPromptAction(prompt);
      if (!expandResult.success) {
        setError(expandResult.error);
        toast.error("Couldn’t expand prompt", {
          description: expandResult.error,
        });
        setScheduling(false);
        return;
      }
      finalContent = expandResult.data;
      setContent(finalContent);
    }

    if (!finalContent) {
      setError("Write a post (or expand a prompt) before scheduling.");
      return;
    }
    if (finalContent.length > maxChars) {
      setError(
        `${limits.label} posts must be ${maxChars.toLocaleString()} characters or fewer.`,
      );
      return;
    }
    if (date < minDate) {
      setError("Pick today or a future day in your timezone.");
      toast.error("That day is already past", {
        description: `Your timezone is ${userTimeZone}.`,
      });
      return;
    }

    setScheduling(true);

    try {
      const imageUrls =
        images.length > 0 ? await resolveImageUrls() : [];
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const result = await createPostAction({
        content: finalContent,
        scheduledAt,
        platform,
        hasImage: imageUrls.length > 0,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (!result.success) {
        setError(result.error);
        toast.error("Couldn’t schedule post", { description: result.error });
        return;
      }

      images.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
      });
      setImages([]);
      setMessage(`Queued for ${date} at ${time} on ${limits.label}.`);
      toast.success("Post scheduled", {
        description: `Queued for ${date} at ${time} on ${limits.label}.`,
      });
      router.push("/dashboard/schedule");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save post.";
      setError(message);
      toast.error("Couldn’t schedule post", { description: message });
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Create
          </p>
          <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.35rem] sm:leading-none">
            Compose for {limits.label}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Write it yourself or drop a prompt for Gemini. Preview, attach
            images, then schedule to X or LinkedIn.
          </p>
        </div>
        {platformConnected ? (
          <Badge className="w-fit rounded-md bg-primary/10 text-primary hover:bg-primary/10">
            {platform === "linkedin" ? (
              <FaLinkedinIn className="mr-1.5 size-3" />
            ) : (
              <SiX className="mr-1.5 size-3" />
            )}
            {platformHandle || `${limits.label} connected`}
          </Badge>
        ) : (
          <Link
            href="/dashboard/settings"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-fit rounded-md",
            )}
          >
            {platform === "linkedin" ? (
              <FaLinkedinIn className="mr-1.5 size-3" />
            ) : (
              <SiX className="mr-1.5 size-3" />
            )}
            Connect {limits.label} to schedule
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlatform("x");
                  setImages((prev) => prev.slice(0, PLATFORM_LIMITS.x.maxImages));
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  platform === "x"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <SiX className="size-3.5" />
                X
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlatform("linkedin");
                  setImages((prev) =>
                    prev.slice(0, PLATFORM_LIMITS.linkedin.maxImages),
                  );
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  platform === "linkedin"
                    ? "bg-[#0a66c2] text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <FaLinkedinIn className="size-3.5" />
                LinkedIn
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode("write")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  mode === "write"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <IoCreateOutline className="size-4" />
                Write post
              </button>
              {platformAiEnabled ? (
                <button
                  type="button"
                  onClick={() => setMode("prompt")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    mode === "prompt"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <HiOutlineSparkles className="size-4" />
                  Drop a prompt
                </button>
              ) : null}
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
                    {`Up to ${maxImages} uploads. AI image gen coming soon.`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md shadow-none"
                  disabled={images.length >= maxImages}
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
                  min={minDate}
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
              <CardDescription>
                How this lands on {limits.label}
              </CardDescription>
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
                        {platformHandle ||
                          (platform === "linkedin" ? "You" : "@you")}
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
                {Math.max(content.length, 0)}/{maxChars}
                {images.length > 0
                  ? ` · ${images.length}/${maxImages} images`
                  : ""}
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
                X and LinkedIn publish from the same calm queue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
