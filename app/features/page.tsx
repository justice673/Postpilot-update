import type { Metadata } from "next";
import PostpilotChannels from "@/components/postpilot/PostpilotChannels";
import PostpilotHow from "@/components/postpilot/PostpilotHow";
import PostpilotJourney from "@/components/postpilot/PostpilotJourney";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotPageIntro from "@/components/postpilot/PostpilotPageIntro";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Features — Postpilot",
  description:
    "X-native scheduling with AI drafts, calendar queue, and more channels on the roadmap.",
};

export default function FeaturesPage() {
  return (
    <PostpilotMarketingShell>
      <PostpilotPageIntro
        eyebrow="Features"
        title="Everything you need to post on purpose."
        description="Connect X, draft with Gemini, and keep a calm queue from idea to publish — with more networks on the way."
      />
      <PostpilotChannels tone="plain" />
      <PostpilotHow />
      <PostpilotJourney />
    </PostpilotMarketingShell>
  );
}
