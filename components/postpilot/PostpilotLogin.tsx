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

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 700);
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
          Use your email, then connect X on the next screen.
        </p>
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
        New here?{" "}
        <Link href="/register" className="pp-login__link">
          Start free
        </Link>
      </motion.p>
    </PostpilotAuthShell>
  );
}
