import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import { countRecentAdminActivity } from "@/lib/services/admin";
import { getProfile } from "@/lib/services/profile";

export const metadata: Metadata = {
  title: "Admin — Postpilot",
  description: "Postpilot system admin panel.",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const [profile, notificationCount] = await Promise.all([
    getProfile().catch(() => null),
    countRecentAdminActivity(24).catch(() => 0),
  ]);

  return (
    <AdminShell profile={profile} notificationCount={notificationCount}>
      {children}
    </AdminShell>
  );
}
