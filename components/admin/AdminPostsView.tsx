"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PiCheckCircle, PiClock, PiWarningCircle } from "react-icons/pi";
import { TiFolderOpen } from "react-icons/ti";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { adminPosts, formatAdminDateTime } from "@/lib/admin/mock-data";

export default function AdminPostsView() {
  const range = useAdminDateRange();
  const posts = useMemo(
    () =>
      [...adminPosts]
        .filter((p) => isIsoInRange(p.scheduledAt, range.from, range.to))
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
        ),
    [range.from, range.to],
  );

  const stats = useMemo(() => {
    const pending = posts.filter((p) => p.status === "pending").length;
    const posted = posts.filter((p) => p.status === "posted").length;
    const failed = posts.filter((p) => p.status === "failed").length;
    return [
      {
        label: "Total posts",
        value: posts.length,
        hint: range.active ? "In selected range" : "Across all users",
        icon: TiFolderOpen,
      },
      {
        label: "Pending",
        value: pending,
        hint: "Scheduled, not live",
        icon: PiClock,
      },
      {
        label: "Published",
        value: posted,
        hint: "Successfully posted",
        icon: PiCheckCircle,
      },
      {
        label: "Failed",
        value: failed,
        hint: "Need attention",
        icon: PiWarningCircle,
      },
    ];
  }, [posts, range.active]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Content
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-none">
          All posts
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Latest scheduled and published posts across all users
          {range.active ? " for the selected date range" : ""}.
        </p>
      </div>

      <AdminStatCards stats={stats} />

      <Card className="max-w-full overflow-hidden shadow-none">
        <CardHeader>
          <CardTitle>{posts.length} posts</CardTitle>
          <CardDescription>
            Showing the most recent by schedule time
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Content</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border/60 align-top last:border-0"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/users/${post.userId}`}
                      className="block hover:text-primary"
                    >
                      <p className="font-medium text-foreground">
                        {post.userDisplayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.userEmail}
                      </p>
                    </Link>
                  </td>
                  <td className="max-w-md py-3 pr-4">
                    <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatAdminDateTime(post.scheduledAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
