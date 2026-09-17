import NotificationsView from "@/components/dashboard/NotificationsView";
import { getNotificationSettings } from "@/lib/services/notifications";
import { DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/types/notifications";

export default async function NotificationsPage() {
  const settings = await getNotificationSettings().catch(
    () => DEFAULT_NOTIFICATION_SETTINGS,
  );

  return <NotificationsView initialSettings={settings} />;
}
