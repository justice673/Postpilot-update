"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArrowLeft,
  FiLogOut,
} from "react-icons/fi";
import {
  HiOutlineBell,
  HiOutlineChevronUpDown,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { MdOutlineSettings } from "react-icons/md";
import { PiUsersThree } from "react-icons/pi";
import { SiGoogleanalytics } from "react-icons/si";
import { TbLayoutDashboard } from "react-icons/tb";
import { TiFolderOpen } from "react-icons/ti";
import PostpilotMark from "@/components/postpilot/PostpilotMark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/profile";
import { toast } from "sonner";

const fallbackUser = {
  name: "Admin",
  email: "",
  initials: "A",
  role: "Super admin",
};

const navSections = [
  {
    title: "System",
    items: [
      { href: "/admin", label: "Overview", icon: TbLayoutDashboard, exact: true },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: SiGoogleanalytics,
      },
      { href: "/admin/users", label: "Users", icon: PiUsersThree },
      { href: "/admin/posts", label: "Posts", icon: TiFolderOpen },
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: HiOutlineBell,
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: MdOutlineSettings,
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({
  profile,
}: {
  profile?: UserProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [query, setQuery] = useState("");
  const user = profile
    ? {
        name: profile.name || fallbackUser.name,
        email: profile.email || fallbackUser.email,
        initials: profile.initials || fallbackUser.initials,
        role: "Super admin",
      }
    : fallbackUser;

  async function confirmLogout() {
    setLogoutOpen(false);
    setOpenMobile(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const filteredSections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.label.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  }));

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Admin panel">
              <Link href="/admin" onClick={() => setOpenMobile(false)}>
                <PostpilotMark size={32} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-[family-name:var(--font-newsreader)] text-base font-medium tracking-tight">
                    Admin<span className="text-primary">Panel</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Super admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <div className="relative px-2">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <SidebarInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-9 pl-9"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredSections.map((section) => (
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
                {section.items.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    No matches
                  </p>
                ) : null}
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
                  tooltip={`${user.name} · ${user.role}`}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs font-medium text-primary">
                      {user.role}
                    </span>
                  </div>
                  <HiOutlineChevronUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                      <span className="mt-1 w-fit rounded-full border border-primary bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      onClick={() => setOpenMobile(false)}
                    >
                      <TbLayoutDashboard className="size-4" />
                      Admin overview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/users"
                      onClick={() => setOpenMobile(false)}
                    >
                      <PiUsersThree className="size-4" />
                      Manage users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      onClick={() => setOpenMobile(false)}
                    >
                      <MdOutlineSettings className="size-4" />
                      System settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpenMobile(false)}
                    >
                      <FiArrowLeft className="size-4" />
                      Exit admin
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                  onClick={() => setLogoutOpen(true)}
                >
                  <FiLogOut className="size-4 text-red-600" />
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
              You’ll need to sign in again to access the admin panel.
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
              <FiLogOut className="size-4" />
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
