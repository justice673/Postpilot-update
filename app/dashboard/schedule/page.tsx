import ScheduleView from "@/components/dashboard/ScheduleView";
import { getPosts } from "@/lib/services/posts";
import { getProfile } from "@/lib/services/profile";

export default async function SchedulePage() {
  const [posts, profile] = await Promise.all([
    getPosts().catch(() => []),
    getProfile().catch(() => null),
  ]);

  return (
    <ScheduleView
      initialPosts={posts}
      timeZone={profile?.timezone ?? null}
    />
  );
}
