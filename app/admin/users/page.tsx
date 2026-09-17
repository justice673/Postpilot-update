import AdminUsersView from "@/components/admin/AdminUsersView";
import type { AdminUser } from "@/lib/admin/types";
import { listAdminUsers } from "@/lib/services/admin";

export default async function AdminUsersPage() {
  const users = await listAdminUsers().catch(() => []);

  const initialUsers: AdminUser[] = users.map((user) => ({
    id: user.userId,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    xConnected: user.xConnected,
    xUsername: user.xUsername || null,
    timezone: user.timezone || "UTC",
    aiWritingEnabled: user.aiWritingEnabled ?? false,
    bio: user.bio || null,
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt,
    postCount: user.postCount,
    pendingCount: user.pendingCount,
    postedCount: user.postedCount,
    failedCount: user.failedCount,
    suspended: user.suspended ?? false,
  }));

  return <AdminUsersView initialUsers={initialUsers} />;
}
