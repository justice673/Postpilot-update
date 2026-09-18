import type { ComponentType } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import { PLATFORM_META, resolvePlatform } from "@/lib/platforms";
import type { PostPlatform } from "@/lib/types/posts";
import { cn } from "@/lib/utils";

const ICONS: Record<
  PostPlatform,
  ComponentType<{ className?: string }>
> = {
  x: SiX,
  linkedin: FaLinkedinIn,
};

export function PlatformMark({
  platform,
  size = "md",
  className,
}: {
  platform?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = resolvePlatform(platform);
  const meta = PLATFORM_META[id];
  const Icon = ICONS[id];
  const box = size === "sm" ? "size-6 rounded-md" : "size-9 rounded-md";
  const icon = size === "sm" ? "size-3" : "size-3.5";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        box,
        meta.markClass,
        className,
      )}
      title={meta.label}
      aria-label={meta.label}
    >
      <Icon className={icon} />
    </span>
  );
}

export function PlatformBadge({
  platform,
  className,
}: {
  platform?: string | null;
  className?: string;
}) {
  const id = resolvePlatform(platform);
  const meta = PLATFORM_META[id];
  const Icon = ICONS[id];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        id === "linkedin"
          ? "bg-[#0a66c2]/12 text-[#0a66c2]"
          : "bg-[#111111]/10 text-[#111111]",
        className,
      )}
    >
      <Icon className="size-2.5" />
      {meta.label}
    </span>
  );
}
