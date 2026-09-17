import AccountView from "@/components/dashboard/AccountView";
import { getProfile } from "@/lib/services/profile";

export default async function AccountPage() {
  const profile = await getProfile().catch(() => ({
    name: "",
    email: "",
    avatar: "",
    initials: "U",
    bio: "",
    timezone: "",
  }));

  return <AccountView initialProfile={profile} />;
}
