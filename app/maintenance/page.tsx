import Link from "next/link";
import { getPlatformSettingsCached } from "@/lib/services/platform-settings";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function MaintenancePage() {
  const settings = await getPlatformSettingsCached();

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_-10%,#cfe0fb_0%,#ffffff_55%)] px-6 py-16 text-center">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          {settings.appName}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-newsreader)] text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          We’ll be right back
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          {settings.appName} is under maintenance. Please check again shortly.
          If you need help, reach us at{" "}
          <a
            href={`mailto:${settings.supportEmail}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {settings.supportEmail}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }), "shadow-none")}
          >
            Admin login
          </Link>
        </div>
      </div>
    </main>
  );
}
