import AdminUserDetailView from "@/components/admin/AdminUserDetailView";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminUserDetailView userId={id} />;
}
