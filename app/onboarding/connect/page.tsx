import type { Metadata } from "next";
import ConnectSocialsOnboarding from "@/components/onboarding/ConnectSocialsOnboarding";
import "../../postpilot.css";

export const metadata: Metadata = {
  title: "Connect socials — Postpilot",
  description: "Connect X to start scheduling with Postpilot.",
};

export default function ConnectOnboardingPage() {
  return <ConnectSocialsOnboarding />;
}
