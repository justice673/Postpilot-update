import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { checkSuperAdmin } from "@/lib/auth/admin";
import { getProfile } from "@/lib/services/profile";

export const metadata: Metadata = {
  title: "Dashboard — Postpilot",
  description: "Schedule and publish posts to X with Postpilot.",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, isAdmin] = await Promise.all([
    getProfile().catch(() => null),
    checkSuperAdmin(),
  ]);

  return (
    <DashboardShell profile={profile} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
