import type { ReactNode } from "react";
import PostpilotCta from "@/components/postpilot/PostpilotCta";
import PostpilotFooter from "@/components/postpilot/PostpilotFooter";
import PostpilotNav from "@/components/postpilot/PostpilotNav";

export default function PostpilotMarketingShell({
  children,
  showCta = true,
}: {
  children: ReactNode;
  showCta?: boolean;
}) {
  return (
    <div className="postpilot-root min-h-screen">
      <PostpilotNav />
      <main>{children}</main>
      {showCta ? <PostpilotCta /> : null}
      <PostpilotFooter />
    </div>
  );
}
