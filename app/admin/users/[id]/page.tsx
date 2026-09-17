import { notFound } from "next/navigation";
import AdminUserDetailView from "@/components/admin/AdminUserDetailView";
import { getAdminUserDetail } from "@/lib/services/admin";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUserDetail(id).catch(() => null);
  if (!user) notFound();
  return <AdminUserDetailView user={user} />;
}
