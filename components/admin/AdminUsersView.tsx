"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiEye,
  FiMoreHorizontal,
  FiShield,
  FiSlash,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { PiUsersThree } from "react-icons/pi";
import { SiX } from "react-icons/si";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { adminUsers as seedUsers, formatAdminDate } from "@/lib/admin/mock-data";
import type { AdminUser, UserRole } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type RowUser = AdminUser & { suspended?: boolean };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export default function AdminUsersView() {
  const range = useAdminDateRange();
  const [users, setUsers] = useState<RowUser[]>(() =>
    seedUsers.map((u) => ({ ...u, suspended: false })),
  );
  const [deleteTarget, setDeleteTarget] = useState<RowUser | null>(null);

  const visibleUsers = useMemo(
    () =>
      users.filter((u) =>
        isIsoInRange(u.createdAt, range.from, range.to),
      ),
    [users, range.from, range.to],
  );

  const countLabel = useMemo(() => {
    const active = visibleUsers.filter((u) => !u.suspended).length;
    return `${visibleUsers.length} users · ${active} active`;
  }, [visibleUsers]);

  const stats = useMemo(() => {
    const active = visibleUsers.filter((u) => !u.suspended).length;
    const suspended = visibleUsers.filter((u) => u.suspended).length;
    const connected = visibleUsers.filter((u) => u.xConnected).length;
    const admins = visibleUsers.filter((u) => u.role === "super_admin").length;
    return [
      {
        label: "Total users",
        value: visibleUsers.length,
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
        value: connected,
        hint: "Ready to publish",
        icon: SiX,
      },
      {
        label: "Admins",
        value: admins,
        hint: suspended ? `${suspended} suspended` : "Super admin access",
        icon: FiShield,
      },
    ];
  }, [visibleUsers, range.active]);

  function toggleSuspend(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, suspended: !u.suspended } : u,
      ),
    );
  }

  function setRole(id: string, role: UserRole) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u)),
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
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
        <CardHeader>
          <CardTitle>{countLabel}</CardTitle>
          <CardDescription>
            Manage profiles, roles, and access
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">X</th>
                <th className="pb-3 pr-4 font-medium">Posts</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Joined</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
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
                    {user.xConnected ? (
                      <span className="text-emerald-700">
                        @{user.xUsername}
                      </span>
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
                          onClick={() => toggleSuspend(user.id)}
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
                            onClick={() => setRole(user.id, "user")}
                          >
                            <FiShield className="size-4" />
                            Remove admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setRole(user.id, "super_admin")}
                          >
                            <FiShield className="size-4" />
                            Make admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                          onClick={() => setDeleteTarget(user)}
                          disabled={user.role === "super_admin"}
                        >
                          <FiTrash2 className="size-4 text-red-600" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No users left.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.displayName} (${deleteTarget.email}) and their posts from Postpilot.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white shadow-none hover:bg-red-700"
              onClick={confirmDelete}
            >
              <FiTrash2 className="size-4" />
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
