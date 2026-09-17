import SettingsView from "@/components/dashboard/SettingsView";
import { getSettings } from "@/lib/services/settings";

export default async function SettingsPage() {
  const settings = await getSettings().catch(() => null);

  return (
    <SettingsView
      xConnected={Boolean(settings?.xConnected)}
      xUsername={settings?.xUsername ?? null}
    />
  );
}
