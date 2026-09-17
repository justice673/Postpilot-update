"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Shows a one-shot toast when landing with ?connected=true after X OAuth. */
export default function ConnectedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("connected") !== "true") return;

    toast.success("X account connected", {
      description: "You’re ready to compose and schedule.",
    });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("connected");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, router, pathname]);

  return null;
}
