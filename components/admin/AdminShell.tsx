"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { GoBell } from "react-icons/go";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageLabels: Record<string, string> = {
  "/admin": "Overview",
  "/admin/analytics": "Analytics",
  "/admin/users": "Users",
  "/admin/posts": "Posts",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

function AdminHeader({ notificationCount = 0 }: { notificationCount?: number }) {
  const pathname = usePathname();
  const pageLabel =
    pageLabels[pathname] ??
    (pathname.startsWith("/admin/users/") ? "User detail" : "Admin");

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-border px-3 sm:px-4 md:px-6">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="mr-1 hidden h-4 sm:mr-2 sm:block" />
      <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <Link
          href="/admin"
          className="hidden font-medium text-muted-foreground hover:text-foreground md:inline"
        >
          Admin
        </Link>
        <span className="hidden text-muted-foreground md:inline">/</span>
        <span className="truncate font-[family-name:var(--font-newsreader)] text-base font-medium tracking-tight text-foreground">
          {pageLabel}
        </span>
      </div>
      <div className="ml-auto flex min-w-0 max-w-full items-center justify-end gap-1.5 sm:gap-2">
        <Suspense
          fallback={
            <div className="h-9 w-24 shrink rounded-md border border-input bg-white sm:w-44" />
          }
        >
          <AdminDateRangeFilter className="min-w-0 shrink" />
        </Suspense>
        <Link
          href="/admin/notifications"
          aria-label={
            notificationCount > 0
              ? `Notifications, ${notificationCount} recent`
              : "Notifications"
          }
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        >
          <GoBell className="size-[18px]" />
          {notificationCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}

export default function AdminShell({
  children,
  profile,
  notificationCount = 0,
}: {
  children: React.ReactNode;
  profile?: import("@/lib/types/profile").UserProfile | null;
  notificationCount?: number;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar profile={profile} />
      <SidebarInset className="min-w-0 overflow-x-hidden bg-[linear-gradient(180deg,#cfe0fb33_0%,#ffffff_28%)]">
        <AdminHeader notificationCount={notificationCount} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/40" />}>
            {children}
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
