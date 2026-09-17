import type { ReactNode } from "react";
import PostpilotMarketingShell from "@/components/postpilot/PostpilotMarketingShell";
import PostpilotPageIntro from "@/components/postpilot/PostpilotPageIntro";

export default function PostpilotLegalLayout({
  eyebrow,
  title,
  description,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PostpilotMarketingShell showCta={false}>
      <PostpilotPageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <article className="pp-legal">
        <div className="pp-legal__inner">
          <p className="pp-legal__updated">Last updated {updated}</p>
          <div className="pp-legal__body">{children}</div>
        </div>
      </article>
    </PostpilotMarketingShell>
  );
}
