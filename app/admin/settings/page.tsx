import AdminSettingsView from "@/components/admin/AdminSettingsView";
import {
  getPlatformSettings,
} from "@/lib/services/platform-settings";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/types/platform-settings";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings().catch((error) => {
    console.error("Failed to load platform settings:", error);
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  });

  return <AdminSettingsView key={settings.updatedAt} initialSettings={settings} />;
}
