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
import { assertSignupsOpenAction } from "@/app/register/actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotRegister() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const signupGate = await assertSignupsOpenAction();
    if (!signupGate.success) {
      setError(signupGate.error);
      toast.error("Signups closed", { description: signupGate.error });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding/connect`,
      },
    });

    if (authError) {
      setError(authError.message);
      toast.error("Couldn’t create account", { description: authError.message });
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Account created");
      router.push("/onboarding/connect");
      router.refresh();
      return;
    }

    setSuccess(
      "Account created! Check your email to confirm your address, then sign in.",
    );
    toast.success("Check your email", {
      description: "Confirm your address, then sign in.",
    });
    setLoading(false);
  }

  return (
    <PostpilotAuthShell variant="register">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.12 }}
      >
        <p className="pp-login__panel-eyebrow">Create account</p>
        <h2 className="pp-login__panel-title">Start posting free</h2>
        <p className="pp-login__panel-sub">
          Free tier includes 10 scheduled posts per month. No credit card
          required.
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
          <span>Password</span>
          <div className="pp-login__control pp-login__control--password">
            <HiOutlineLockClosed className="pp-login__icon" aria-hidden />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <label className="pp-login__field">
          <span>Confirm password</span>
          <div className="pp-login__control pp-login__control--password">
            <HiOutlineLockClosed className="pp-login__icon" aria-hidden />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              className="pp-login__reveal"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <HiOutlineEyeSlash aria-hidden />
              ) : (
                <HiOutlineEye aria-hidden />
              )}
            </button>
          </div>
        </label>

        {error ? <p className="pp-login__error">{error}</p> : null}
        {success ? <p className="pp-login__success">{success}</p> : null}

        <button
          type="submit"
          className="pp-btn pp-btn--primary pp-login__submit"
          disabled={loading}
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </motion.form>

      <motion.p
        className="pp-login__switch"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        Already have an account?{" "}
        <Link href="/login" className="pp-login__link">
          Sign in
        </Link>
      </motion.p>
    </PostpilotAuthShell>
  );
}
