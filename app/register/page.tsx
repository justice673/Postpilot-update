import type { Metadata } from "next";
import PostpilotRegister from "@/components/postpilot/PostpilotRegister";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Sign up — Postpilot",
  description: "Create a Postpilot account to schedule and publish posts to X and LinkedIn.",
};

export default function RegisterPage() {
  return <PostpilotRegister />;
}
