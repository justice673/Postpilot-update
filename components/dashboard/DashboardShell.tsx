"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { GoBell } from "react-icons/go";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import ConnectedToast from "@/components/dashboard/ConnectedToast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DateRangeFilter from "@/components/DateRangeFilter";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { UserProfile } from "@/lib/types/profile";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/create": "Create",
  "/dashboard/schedule": "Schedule",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/account": "Account",
  "/dashboard/notifications": "Notifications",
};

function DashboardHeader() {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname] ?? "Dashboard";
  const showDateFilter =
    pathname === "/dashboard" || pathname === "/dashboard/analytics";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-border px-3 sm:px-4 md:px-6">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator
        orientation="vertical"
        className="mr-1 hidden h-4 sm:mr-2 sm:block"
      />
      <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <Link
          href="/dashboard"
          className="hidden font-medium text-muted-foreground hover:text-foreground md:inline"
        >
          Postpilot
        </Link>
        <span className="hidden text-muted-foreground md:inline">/</span>
        <span className="truncate font-[family-name:var(--font-newsreader)] text-base font-medium tracking-tight text-foreground">
          {pageLabel}
        </span>
      </div>
      <div className="ml-auto flex min-w-0 max-w-full items-center justify-end gap-1.5 sm:gap-2">
        {showDateFilter ? (
          <Suspense
            fallback={
              <div className="h-9 w-24 shrink rounded-md border border-input bg-white sm:w-44" />
            }
          >
            <DateRangeFilter className="min-w-0 shrink" />
          </Suspense>
        ) : (
          <div className="relative hidden md:block">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search posts…"
              className="h-9 w-52 rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-64"
            />
          </div>
        )}
        <Link
          href="/dashboard/notifications"
          aria-label="Notifications"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        >
          <GoBell className="size-[18px]" />
        </Link>
      </div>
    </header>
  );
}

export default function DashboardShell({
  children,
  profile,
  isAdmin = false,
}: {
  children: React.ReactNode;
  profile?: UserProfile | null;
  isAdmin?: boolean;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar profile={profile} isAdmin={isAdmin} />
      <SidebarInset className="min-w-0 overflow-x-hidden bg-[linear-gradient(180deg,#cfe0fb33_0%,#ffffff_28%)]">
        <Suspense fallback={null}>
          <ConnectedToast />
        </Suspense>
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
