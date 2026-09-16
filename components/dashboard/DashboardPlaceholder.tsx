import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "mt-2 w-fit")}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
