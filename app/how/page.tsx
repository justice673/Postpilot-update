import type { Metadata } from "next";
import PostpilotHow from "@/components/postpilot/PostpilotHow";
import PostpilotJourney from "@/components/postpilot/PostpilotJourney";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "How it works — Postpilot",
  description:
    "Connect X, compose or expand with AI, then schedule or ship — idea to timeline in three moves.",
};

export default function HowPage() {
  return (
    <PostpilotMarketingShell>
      <div className="pp-page-pad">
        <PostpilotHow />
        <PostpilotJourney />
      </div>
    </PostpilotMarketingShell>
  );
}
