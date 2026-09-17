import type { Metadata } from "next";
import PostpilotLogin from "@/components/postpilot/PostpilotLogin";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Sign in — Postpilot",
  description: "Sign in to Postpilot to schedule and publish posts to X.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.signups;
  const signupsClosed = (Array.isArray(raw) ? raw[0] : raw) === "closed";

  return <PostpilotLogin signupsClosed={signupsClosed} />;
}
