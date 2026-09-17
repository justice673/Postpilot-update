import type { Metadata } from "next";
import PostpilotCreators from "@/components/postpilot/PostpilotCreators";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotTestimonials from "@/components/postpilot/PostpilotTestimonials";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Creators — Postpilot",
  description:
    "Built for founders, writers, and teams who post with intention on X.",
};

export default function CreatorsPage() {
  return (
    <PostpilotMarketingShell>
      <div className="pp-page-pad">
        <PostpilotCreators />
        <PostpilotTestimonials />
      </div>
    </PostpilotMarketingShell>
  );
}
