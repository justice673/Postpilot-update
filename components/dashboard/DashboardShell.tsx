"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoBell } from "react-icons/go";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/create": "Create",
  "/dashboard/schedule": "Schedule",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

function DashboardHeader() {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname] ?? "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex min-w-0 items-center gap-2 text-sm">
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
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts…"
            className="h-9 w-52 rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-64"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        >
          <GoBell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="bg-[linear-gradient(180deg,#cfe0fb33_0%,#ffffff_28%)]">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
