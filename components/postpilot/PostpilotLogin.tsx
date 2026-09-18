"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import PostpilotAuthShell from "@/components/postpilot/PostpilotAuthShell";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotLogin({
  signupsClosed = false,
}: {
  signupsClosed?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      toast.error("Sign in failed", { description: authError.message });
      setLoading(false);
      return;
    }

    toast.success("Welcome back");
    router.push("/onboarding/connect");
    router.refresh();
  }

  return (
    <PostpilotAuthShell variant="login">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.12 }}
      >
        <p className="pp-login__panel-eyebrow">Account</p>
        <h2 className="pp-login__panel-title">Sign in to Postpilot</h2>
        <p className="pp-login__panel-sub">
          Use your email, then connect X or LinkedIn on the next screen.
        </p>
        {signupsClosed ? (
          <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            New signups are currently closed. Existing accounts can still sign
            in.
          </p>
        ) : null}
      </motion.div>

      <motion.form
        className="pp-login__form"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease, delay: 0.22 }}
      >
        <label className="pp-login__field">
          <span>Email</span>
          <div className="pp-login__control">
            <HiOutlineEnvelope className="pp-login__icon" aria-hidden />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </label>

        <label className="pp-login__field">
          <span className="pp-login__field-row">
            Password
            <Link href="/forgot-password" className="pp-login__ghost-link">
              Forgot?
            </Link>
          </span>
          <div className="pp-login__control pp-login__control--password">
            <HiOutlineLockClosed className="pp-login__icon" aria-hidden />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pp-login__reveal"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <HiOutlineEyeSlash aria-hidden />
              ) : (
                <HiOutlineEye aria-hidden />
              )}
            </button>
          </div>
        </label>

        {error ? <p className="pp-login__error">{error}</p> : null}

        <button
          type="submit"
          className="pp-btn pp-btn--primary pp-login__submit"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </motion.form>

      <motion.p
        className="pp-login__switch"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        {signupsClosed ? (
          "New accounts can’t be created right now."
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="pp-login__link">
              Start free
            </Link>
          </>
        )}
      </motion.p>
    </PostpilotAuthShell>
  );
}
