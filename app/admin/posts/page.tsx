import AdminPostsView from "@/components/admin/AdminPostsView";
import { listAdminPosts } from "@/lib/services/admin";

export default async function AdminPostsPage() {
  const posts = await listAdminPosts(500).catch(() => []);
  return <AdminPostsView initialPosts={posts} />;
}
