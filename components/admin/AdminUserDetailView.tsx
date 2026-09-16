"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiSlash,
  FiSparkles,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import { SiX } from "react-icons/si";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
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
  formatAdminDate,
  formatAdminDateTime,
  getAdminUser,
  getPostsForUser,
} from "@/lib/admin/mock-data";
import type { PostStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type FilterKey = "all" | PostStatus;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export default function AdminUserDetailView({ userId }: { userId: string }) {
  const user = getAdminUser(userId);
  const posts = useMemo(
    () => (user ? getPostsForUser(user.id) : []),
    [user],
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [suspended, setSuspended] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removed, setRemoved] = useState(false);

  const counts = useMemo(() => {
    const pending = posts.filter((p) => p.status === "pending").length;
    const posted = posts.filter((p) => p.status === "posted").length;
    const failed = posts.filter((p) => p.status === "failed").length;
    return {
      total: posts.length,
      pending,
      posted,
      failed,
    };
  }, [posts]);

  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => p.status === filter);
  }, [filter, posts]);

  if (!user) notFound();

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.total },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "posted", label: "Published", count: counts.posted },
    { key: "failed", label: "Failed", count: counts.failed },
  ];

  if (removed) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
          User deleted
        </h1>
        <p className="text-muted-foreground">
          {user.displayName} has been removed from Postpilot.
        </p>
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <Link
          href="/admin/users"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-3 -ml-2",
          )}
        >
          <FiArrowLeft className="size-4" />
          All users
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
                {initials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
                  {user.displayName}
                </h1>
                {user.role === "super_admin" ? (
                  <Badge variant="default">Super admin</Badge>
                ) : null}
                {suspended ? (
                  <Badge variant="danger">Suspended</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
              <p className="mt-2 flex items-center gap-2 text-[15px] text-muted-foreground">
                <FiMail className="size-4 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setSuspended((v) => !v)}
            >
              {suspended ? (
                <>
                  <FiCheckCircle className="size-4" />
                  Reactivate
                </>
              ) : (
                <>
                  <FiSlash className="size-4" />
                  Suspend
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
              disabled={user.role === "super_admin"}
              onClick={() => setDeleteOpen(true)}
            >
              <FiTrash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total posts</CardDescription>
            <FiCalendar className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
              {counts.total}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              In this account queue
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Pending</CardDescription>
            <FiClock className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
              {counts.pending}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled, not live yet
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Published</CardDescription>
            <FiCheckCircle className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
              {counts.posted}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Successfully posted to X
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Failed</CardDescription>
            <FiXCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
              {counts.failed}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Complete account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Display name
                </p>
                <p className="mt-1 font-medium">{user.displayName}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 font-medium">{user.email}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <SiX className="size-3" />
                  X account
                </p>
                <p className="font-medium">
                  {user.xConnected
                    ? `@${user.xUsername}`
                    : "Not connected"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FiMapPin className="size-3" />
                  Timezone
                </p>
                <p className="font-medium">{user.timezone}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FiSparkles className="size-3" />
                  AI writing
                </p>
                <p className="font-medium">
                  {user.aiWritingEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Joined
                </p>
                <p className="mt-1 font-medium">
                  {formatAdminDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Bio</p>
              <p className="mt-1 leading-relaxed text-foreground">
                {user.bio ?? "No bio added."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Account snapshot</CardTitle>
            <CardDescription>Quick status for support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">
                {user.role === "super_admin" ? "Super admin" : "User"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-muted-foreground">Access</span>
              <span className="font-medium">
                {suspended ? "Suspended" : "Active"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-muted-foreground">X linked</span>
              <span className="font-medium">
                {user.xConnected ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs font-medium">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Posts</CardTitle>
            <CardDescription>
              {counts.total} total · {counts.pending} pending · {counts.posted}{" "}
              published · {counts.failed} failed
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === item.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    filter === item.key
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <PostStatusBadge status={post.status} />
                <span className="text-xs text-muted-foreground">
                  {formatAdminDateTime(post.scheduledAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {post.content}
              </p>
            </div>
          ))}
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "" : filter} posts for this user.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently remove {user.displayName} and their posts
              from Postpilot.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white shadow-none hover:bg-red-700"
              onClick={() => {
                setDeleteOpen(false);
                setRemoved(true);
              }}
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
