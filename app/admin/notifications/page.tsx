import AdminNotificationsView from "@/components/admin/AdminNotificationsView";
import {
  countRecentAdminActivity,
  listAdminActivity,
} from "@/lib/services/admin";

export default async function AdminNotificationsPage() {
  const [items, recentCount] = await Promise.all([
    listAdminActivity(300).catch(() => []),
    countRecentAdminActivity(24).catch(() => 0),
  ]);

  return (
    <AdminNotificationsView items={items} recentCount={recentCount} />
  );
}
