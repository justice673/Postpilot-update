"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineEnvelope } from "react-icons/hi2";
import PostpilotAuthShell from "@/components/postpilot/PostpilotAuthShell";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotForgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  return (
    <PostpilotAuthShell variant="forgot">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.12 }}
      >
        <p className="pp-login__panel-eyebrow">Password</p>
        <h2 className="pp-login__panel-title">Forgot password?</h2>
        <p className="pp-login__panel-sub">
          We&apos;ll email you a link to choose a new one.
        </p>
      </motion.div>

      {sent ? (
        <motion.div
          className="pp-login__success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p>
            If an account exists for <strong>{email}</strong>, a reset link is
            on the way.
          </p>
          <Link href="/login" className="pp-btn pp-btn--primary pp-login__submit">
            Back to sign in
          </Link>
        </motion.div>
      ) : (
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

          <button
            type="submit"
            className="pp-btn pp-btn--primary pp-login__submit"
            disabled={loading}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </motion.form>
      )}

      <motion.p
        className="pp-login__switch"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        Remembered it?{" "}
        <Link href="/login" className="pp-login__link">
          Sign in
        </Link>
      </motion.p>
    </PostpilotAuthShell>
  );
}
