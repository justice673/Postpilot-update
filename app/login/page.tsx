import type { Metadata } from "next";
import PostpilotLogin from "@/components/postpilot/PostpilotLogin";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Sign in — Postpilot",
  description: "Sign in to Postpilot to schedule and publish posts to X.",
};

export default function LoginPage() {
  return <PostpilotLogin />;
}
