"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiMoreHorizontal,
  FiShield,
  FiSlash,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { FaLinkedinIn } from "react-icons/fa6";
import { PiUsersThree } from "react-icons/pi";
import { SiX } from "react-icons/si";
import {
  deleteUserAction,
  setUserRoleAction,
  setUserSuspendedAction,
} from "@/app/admin/users/actions";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminTablePagination, {
  paginateRows,
} from "@/components/admin/AdminTablePagination";
import ColumnHeaderMenu from "@/components/admin/ColumnHeaderMenu";
import { PlatformMark } from "@/components/dashboard/PlatformMark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { formatAdminDate } from "@/lib/format";
import type { AdminUser, UserRole } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RowUser = AdminUser;
type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "suspended";
type ChannelFilter = "all" | "x" | "linkedin" | "any" | "none";
type NameSort = "default" | "az" | "za";
type PostsSort = "default" | "high" | "low";
type JoinedSort = "default" | "newest" | "oldest";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export default function AdminUsersView({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const router = useRouter();
  const range = useAdminDateRange();
  const [users, setUsers] = useState<RowUser[]>(initialUsers);
  const [deleteTarget, setDeleteTarget] = useState<RowUser | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [nameSort, setNameSort] = useState<NameSort>("default");
  const [postsSort, setPostsSort] = useState<PostsSort>("default");
  const [joinedSort, setJoinedSort] = useState<JoinedSort>("default");

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const pending = pendingId !== null;

  const rangedUsers = useMemo(
    () =>
      users.filter((u) => isIsoInRange(u.createdAt, range.from, range.to)),
    [users, range.from, range.to],
  );

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rangedUsers.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && u.suspended) return false;
      if (statusFilter === "suspended" && !u.suspended) return false;
      if (channelFilter === "x" && !u.xConnected) return false;
      if (channelFilter === "linkedin" && !u.linkedinConnected) return false;
      if (channelFilter === "any" && !u.xConnected && !u.linkedinConnected)
        return false;
      if (channelFilter === "none" && (u.xConnected || u.linkedinConnected))
        return false;
      if (!q) return true;
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.xUsername?.toLowerCase().includes(q) ?? false) ||
        (u.linkedinUsername?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    if (nameSort === "az") {
      sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (nameSort === "za") {
      sorted.sort((a, b) => b.displayName.localeCompare(a.displayName));
    } else if (postsSort === "high") {
      sorted.sort((a, b) => b.postCount - a.postCount);
    } else if (postsSort === "low") {
      sorted.sort((a, b) => a.postCount - b.postCount);
    } else if (joinedSort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (joinedSort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return sorted;
  }, [
    rangedUsers,
    roleFilter,
    statusFilter,
    channelFilter,
    query,
    nameSort,
    postsSort,
    joinedSort,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    range.from,
    range.to,
    pageSize,
    roleFilter,
    statusFilter,
    channelFilter,
    query,
    nameSort,
    postsSort,
    joinedSort,
  ]);

  const pageCount = Math.max(1, Math.ceil(visibleUsers.length / pageSize) || 1);
  const safePage = Math.min(page, pageCount);
  const pagedUsers = useMemo(
    () => paginateRows(visibleUsers, safePage, pageSize),
    [visibleUsers, safePage, pageSize],
  );

  const countLabel = useMemo(() => {
    const active = visibleUsers.filter((u) => !u.suspended).length;
    return `${visibleUsers.length} users · ${active} active`;
  }, [visibleUsers]);

  const stats = useMemo(() => {
    const active = rangedUsers.filter((u) => !u.suspended).length;
    const suspended = rangedUsers.filter((u) => u.suspended).length;
    const xConnected = rangedUsers.filter((u) => u.xConnected).length;
    const linkedinConnected = rangedUsers.filter(
      (u) => u.linkedinConnected,
    ).length;
    return [
      {
        label: "Total users",
        value: rangedUsers.length,
        hint: range.active ? "In selected range" : "Registered accounts",
        icon: PiUsersThree,
      },
      {
        label: "Active",
        value: active,
        hint: "Can access the app",
        icon: FiUserCheck,
      },
      {
        label: "X connected",
        value: xConnected,
        hint: "Ready to publish on X",
        icon: SiX,
      },
      {
        label: "LinkedIn connected",
        value: linkedinConnected,
        hint: suspended
          ? `${suspended} suspended`
          : "Ready to publish on LinkedIn",
        icon: FaLinkedinIn,
      },
    ];
  }, [rangedUsers, range.active]);

  const filtersActive =
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    channelFilter !== "all" ||
    nameSort !== "default" ||
    postsSort !== "default" ||
    joinedSort !== "default" ||
    query.trim().length > 0;

  function clearColumnSorts(except?: "name" | "posts" | "joined") {
    if (except !== "name") setNameSort("default");
    if (except !== "posts") setPostsSort("default");
    if (except !== "joined") setJoinedSort("default");
  }

  function refreshAfterToast() {
    window.setTimeout(() => router.refresh(), 250);
  }

  async function toggleSuspend(user: RowUser) {
    const next = !user.suspended;
    setPendingId(user.id);
    try {
      const result = await setUserSuspendedAction(user.id, next);
      if (!result.success) {
        toast.error("Couldn’t update user", { description: result.error });
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, suspended: next } : u)),
      );
      toast.success(next ? "User suspended" : "User reactivated");
      refreshAfterToast();
    } finally {
      setPendingId(null);
    }
  }

  async function setRole(user: RowUser, role: UserRole) {
    setPendingId(user.id);
    try {
      const result = await setUserRoleAction(user.id, role);
      if (!result.success) {
        toast.error("Couldn’t update role", { description: result.error });
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role } : u)),
      );
      toast.success(
        role === "super_admin" ? "Granted admin access" : "Removed admin access",
      );
      refreshAfterToast();
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setPendingId(target.id);
    try {
      const result = await deleteUserAction(target.id);
      if (!result.success) {
        toast.error("Couldn’t delete user", { description: result.error });
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setDeleteTarget(null);
      toast.success("User deleted");
      refreshAfterToast();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Accounts
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          All accounts registered in Postpilot
          {range.active ? " for the selected date range" : ""}.
        </p>
      </div>

      <AdminStatCards stats={stats} />

      <Card className="max-w-full overflow-hidden shadow-none">
        <CardHeader className="gap-4 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{countLabel}</CardTitle>
              <CardDescription>
                Use column menus to filter and sort
              </CardDescription>
            </div>
            {filtersActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground shadow-none"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setChannelFilter("all");
                  setNameSort("default");
                  setPostsSort("default");
                  setJoinedSort("default");
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="relative max-w-md">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, or channel…"
              className="h-10 pl-9 shadow-none"
              aria-label="Search users"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="User"
                    value={nameSort}
                    onChange={(value) => {
                      clearColumnSorts("name");
                      setNameSort(value);
                    }}
                    options={[
                      { value: "default", label: "Default order" },
                      { value: "az", label: "Name A → Z" },
                      { value: "za", label: "Name Z → A" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Channels"
                    value={channelFilter}
                    onChange={setChannelFilter}
                    options={[
                      { value: "all", label: "All channels" },
                      { value: "x", label: "X connected" },
                      { value: "linkedin", label: "LinkedIn connected" },
                      { value: "any", label: "Any channel" },
                      { value: "none", label: "No channels" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Posts"
                    value={postsSort}
                    onChange={(value) => {
                      clearColumnSorts("posts");
                      setPostsSort(value);
                    }}
                    options={[
                      { value: "default", label: "Default order" },
                      { value: "high", label: "Most posts" },
                      { value: "low", label: "Fewest posts" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Role"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                      { value: "all", label: "All roles" },
                      { value: "user", label: "User" },
                      { value: "super_admin", label: "Super admin" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                </th>
                <th className="py-3 pr-4">
                  <ColumnHeaderMenu
                    label="Joined"
                    value={joinedSort}
                    onChange={(value) => {
                      clearColumnSorts("joined");
                      setJoinedSort(value);
                    }}
                    options={[
                      { value: "default", label: "Default order" },
                      { value: "newest", label: "Newest first" },
                      { value: "oldest", label: "Oldest first" },
                    ]}
                  />
                </th>
                <th className="py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex items-center gap-3 hover:opacity-90"
                    >
                      <Avatar className="size-10 rounded-xl">
                        {user.avatarUrl ? (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="rounded-xl object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="rounded-xl bg-primary/15 text-sm font-semibold text-primary">
                          {initials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {user.displayName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {user.xConnected || user.linkedinConnected ? (
                      <div className="flex flex-col gap-1.5">
                        {user.xConnected ? (
                          <span className="inline-flex items-center gap-1.5 text-foreground">
                            <PlatformMark platform="x" size="sm" />
                            <span className="text-emerald-700">
                              @{user.xUsername}
                            </span>
                          </span>
                        ) : null}
                        {user.linkedinConnected ? (
                          <span className="inline-flex items-center gap-1.5 text-foreground">
                            <PlatformMark platform="linkedin" size="sm" />
                            <span className="text-emerald-700">
                              {user.linkedinUsername || "LinkedIn"}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium">{user.postCount}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {user.pendingCount} pending · {user.postedCount} posted ·{" "}
                      {user.failedCount} failed
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {user.role === "super_admin" ? (
                      <Badge variant="default">Super admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {user.suspended ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {formatAdminDate(user.createdAt)}
                  </td>
                  <td className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "size-8",
                          )}
                          aria-label={`Actions for ${user.displayName}`}
                          disabled={pending}
                        >
                          <FiMoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <FiEye className="size-4" />
                            View profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            void toggleSuspend(user);
                          }}
                          disabled={pending}
                        >
                          {user.suspended ? (
                            <>
                              <FiUserCheck className="size-4" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <FiSlash className="size-4" />
                              Suspend user
                            </>
                          )}
                        </DropdownMenuItem>
                        {user.role === "super_admin" ? (
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              void setRole(user, "user");
                            }}
                            disabled={pending}
                          >
                            <FiShield className="size-4" />
                            Remove admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              void setRole(user, "super_admin");
                            }}
                            disabled={pending}
                          >
                            <FiShield className="size-4" />
                            Make admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                          onSelect={() => {
                            window.setTimeout(() => setDeleteTarget(user), 0);
                          }}
                          disabled={user.role === "super_admin" || pending}
                        >
                          <FiTrash2 className="size-4 text-red-600" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {range.active || filtersActive
                      ? "No users match these filters."
                      : "No users yet."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {visibleUsers.length > 0 ? (
            <AdminTablePagination
              total={visibleUsers.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !pending) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This permanently removes ${deleteTarget.displayName} (${deleteTarget.email}), their posts, and settings.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              disabled={pending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white shadow-none hover:bg-red-700"
              disabled={pending}
              onClick={() => void confirmDelete()}
            >
              <FiTrash2 className="size-4" />
              {pending ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
