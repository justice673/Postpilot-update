import type { PostPlatform } from "@/lib/types/posts";

export const PLATFORM_META: Record<
  PostPlatform,
  {
    id: PostPlatform;
    label: string;
    shortLabel: string;
    markClass: string;
  }
> = {
  x: {
    id: "x",
    label: "X",
    shortLabel: "X",
    markClass: "bg-[#111111] text-white",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "in",
    markClass: "bg-[#0a66c2] text-white",
  },
};

export function resolvePlatform(platform?: string | null): PostPlatform {
  return platform === "linkedin" ? "linkedin" : "x";
}

export function platformLabel(platform?: string | null): string {
  return PLATFORM_META[resolvePlatform(platform)].label;
}

export function formatConnectedChannels(input: {
  xConnected?: boolean;
  xUsername?: string | null;
  linkedinConnected?: boolean;
  linkedinUsername?: string | null;
}): string {
  const parts: string[] = [];
  if (input.xConnected) {
    parts.push(input.xUsername ? `X @${input.xUsername}` : "X");
  }
  if (input.linkedinConnected) {
    parts.push(
      input.linkedinUsername
        ? `LinkedIn ${input.linkedinUsername}`
        : "LinkedIn",
    );
  }
  return parts.join(" · ");
}
