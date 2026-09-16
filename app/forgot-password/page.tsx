import type { Metadata } from "next";
import PostpilotForgot from "@/components/postpilot/PostpilotForgot";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Forgot password — Postpilot",
  description: "Reset your Postpilot password.",
};

export default function ForgotPasswordPage() {
  return <PostpilotForgot />;
}
