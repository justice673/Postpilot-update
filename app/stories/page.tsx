import type { Metadata } from "next";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotTestimonials from "@/components/postpilot/PostpilotTestimonials";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Stories — Postpilot",
  description: "What early posters say about scheduling with Postpilot.",
};

export default function StoriesPage() {
  return (
    <PostpilotMarketingShell>
      <div className="pp-page-pad">
        <PostpilotTestimonials />
      </div>
    </PostpilotMarketingShell>
  );
}
