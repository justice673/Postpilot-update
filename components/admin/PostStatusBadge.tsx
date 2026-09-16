import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const styles: Record<PostStatus, string> = {
  pending: "border-primary bg-white text-primary",
  posted: "border-emerald-500 bg-white text-emerald-600",
  failed: "border-red-500 bg-white text-red-600",
};

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", styles[status], className)}
    >
      {status === "posted" ? "Published" : status}
    </Badge>
  );
}
