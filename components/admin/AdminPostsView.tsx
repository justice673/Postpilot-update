"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PiCheckCircle, PiClock, PiWarningCircle } from "react-icons/pi";
import { TiFolderOpen } from "react-icons/ti";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminTablePagination, {
  paginateRows,
} from "@/components/admin/AdminTablePagination";
import SegmentedFilter from "@/components/admin/SegmentedFilter";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isIsoInRange, useAdminDateRange } from "@/lib/admin/date-range";
import { formatAdminDateTime } from "@/lib/format";
import type { AdminPost } from "@/lib/types/admin";
import type { PostStatus } from "@/lib/types/posts";

type FilterKey = "all" | PostStatus;

export default function AdminPostsView({
  initialPosts,
}: {
  initialPosts: AdminPost[];
}) {
  const range = useAdminDateRange();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rangedPosts = useMemo(
    () =>
      [...initialPosts]
        .filter((p) => isIsoInRange(p.scheduledAt, range.from, range.to))
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
        ),
    [initialPosts, range.from, range.to],
  );

  const posts = useMemo(() => {
    if (filter === "all") return rangedPosts;
    return rangedPosts.filter((p) => p.status === filter);
  }, [rangedPosts, filter]);

  useEffect(() => {
    setPage(1);
  }, [range.from, range.to, filter, pageSize]);

  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize) || 1);
  const safePage = Math.min(page, pageCount);
  const pagedPosts = useMemo(
    () => paginateRows(posts, safePage, pageSize),
    [posts, safePage, pageSize],
  );

  const stats = useMemo(() => {
    const pending = rangedPosts.filter((p) => p.status === "pending").length;
    const posted = rangedPosts.filter((p) => p.status === "posted").length;
    const failed = rangedPosts.filter((p) => p.status === "failed").length;
    return [
      {
        label: "Total posts",
        value: rangedPosts.length,
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
  }, [rangedPosts, range.active]);

  const filters: { value: FilterKey; label: string; count: number }[] = [
    { value: "all", label: "All", count: rangedPosts.length },
    {
      value: "pending",
      label: "Pending",
      count: rangedPosts.filter((p) => p.status === "pending").length,
    },
    {
      value: "posted",
      label: "Published",
      count: rangedPosts.filter((p) => p.status === "posted").length,
    },
    {
      value: "failed",
      label: "Failed",
      count: rangedPosts.filter((p) => p.status === "failed").length,
    },
  ];

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
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{posts.length} posts</CardTitle>
            <CardDescription>
              Showing the most recent by schedule time
            </CardDescription>
          </div>
          <SegmentedFilter
            layoutId="admin-posts-status-filter"
            value={filter}
            onChange={setFilter}
            items={filters}
          />
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
              {pagedPosts.map((post) => (
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
                    {post.hasImage ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Includes image
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatAdminDateTime(post.scheduledAt)}
                  </td>
                </tr>
              ))}
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {range.active
                      ? "No posts in this date range."
                      : filter === "all"
                        ? "No posts yet."
                        : `No ${filter} posts.`}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {posts.length > 0 ? (
            <AdminTablePagination
              total={posts.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
