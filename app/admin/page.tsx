import AdminOverview from "@/components/admin/AdminOverview";
import { parseDateRangeParams } from "@/lib/date-range";
import { getAdminOverview } from "@/lib/services/admin";
import { getAdminDashboardChartData } from "@/lib/services/admin-analytics";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = parseDateRangeParams(params);

  const [overview, activity] = await Promise.all([
    getAdminOverview(range).catch(() => ({
      totalUsers: 0,
      totalPosts: 0,
      pendingPosts: 0,
      postedPosts: 0,
      failedPosts: 0,
      xConnectedUsers: 0,
      linkedinConnectedUsers: 0,
    })),
    getAdminDashboardChartData(range ?? 7).catch(() => []),
  ]);

  return <AdminOverview overview={overview} activity={activity} />;
}
