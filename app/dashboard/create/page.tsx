import CreatePostForm from "@/components/dashboard/CreatePostForm";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { getProfile } from "@/lib/services/profile";
import { getSettings } from "@/lib/services/settings";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawDate = params.date;
  const initialDate = Array.isArray(rawDate) ? rawDate[0] : rawDate;

  const [settings, profile, platform] = await Promise.all([
    getSettings().catch(() => null),
    getProfile().catch(() => null),
    getPlatformSettings().catch(() => null),
  ]);

  return (
    <CreatePostForm
      xConnected={Boolean(settings?.xConnected)}
      xUsername={settings?.xUsername ?? null}
      initialDate={initialDate ?? null}
      timeZone={profile?.timezone ?? null}
      platformAiEnabled={platform?.aiWritingEnabled ?? true}
    />
  );
}
