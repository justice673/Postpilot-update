import type { Metadata } from "next";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotPricing from "@/components/postpilot/PostpilotPricing";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Pricing — Postpilot",
  description:
    "Simple Postpilot plans — Free, Pro, and Team. Same calm queue at every tier.",
};

export default function PricingPage() {
  return (
    <PostpilotMarketingShell>
      <div className="pp-page-pad">
        <PostpilotPricing />
      </div>
    </PostpilotMarketingShell>
  );
}
