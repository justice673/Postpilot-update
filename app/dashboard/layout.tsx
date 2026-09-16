import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — Postpilot",
  description: "Schedule and publish posts to X with Postpilot.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
