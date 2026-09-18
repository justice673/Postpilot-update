import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ConnectSocialsOnboarding from "@/components/onboarding/ConnectSocialsOnboarding";
import { getSettings } from "@/lib/services/settings";
import "../../postpilot.css";

export const metadata: Metadata = {
  title: "Connect socials — Postpilot",
  description: "Connect X or LinkedIn to start scheduling with Postpilot.",
};

export default async function ConnectOnboardingPage() {
  const settings = await getSettings().catch(() => null);

  if (settings?.xConnected && settings?.linkedinConnected) {
    redirect("/dashboard");
  }

  return (
    <ConnectSocialsOnboarding
      initiallyConnected={Boolean(settings?.xConnected)}
      xUsername={settings?.xUsername ?? null}
      linkedinConnected={Boolean(settings?.linkedinConnected)}
      linkedinUsername={settings?.linkedinUsername ?? null}
    />
  );
}
