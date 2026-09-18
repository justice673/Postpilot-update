"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { FiShield } from "react-icons/fi";
import { IoCreateOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { PiCalendarLight } from "react-icons/pi";
import { SiGoogleanalytics } from "react-icons/si";
import { TbLayoutDashboard } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import PostpilotMark from "@/components/postpilot/PostpilotMark";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/profile";
import { toast } from "sonner";

const fallbackUser = {
  name: "User",
  email: "",
  initials: "U",
};

const navSections = [
  {
    title: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: TbLayoutDashboard,
        exact: true,
      },
      { href: "/dashboard/create", label: "Create", icon: IoCreateOutline },
      { href: "/dashboard/schedule", label: "Schedule", icon: PiCalendarLight },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: SiGoogleanalytics,
      },
      { href: "/dashboard/settings", label: "Settings", icon: MdOutlineSettings },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        href: "/admin",
        label: "Admin panel",
        icon: FiShield,
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar({
  profile,
  isAdmin = false,
}: {
  profile?: UserProfile | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = profile
    ? {
        name: profile.name || fallbackUser.name,
        email: profile.email || fallbackUser.email,
        initials: profile.initials || fallbackUser.initials,
        avatar: profile.avatar || "",
      }
    : { ...fallbackUser, avatar: "" };

  async function confirmLogout() {
    setLogoutOpen(false);
    setOpenMobile(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const sections = isAdmin
    ? navSections
    : navSections.filter((section) => section.title !== "Admin");

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Postpilot">
              <Link href="/dashboard" onClick={() => setOpenMobile(false)}>
                <PostpilotMark size={32} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-[family-name:var(--font-newsreader)] text-base font-medium tracking-tight">
                    Postpilot
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    X scheduler
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href, item.exact)}
                      tooltip={item.label}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip={user.name}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                        className="rounded-lg object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      {user.avatar ? (
                        <AvatarImage
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-lg object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/account"
                      onClick={() => setOpenMobile(false)}
                    >
                      <BadgeCheck />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setOpenMobile(false)}
                    >
                      <CreditCard />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setOpenMobile(false)}
                    >
                      <Bell />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="text-red-600" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You’ll need to sign in again to manage your queue and schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white shadow-none hover:bg-red-700"
              onClick={confirmLogout}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
