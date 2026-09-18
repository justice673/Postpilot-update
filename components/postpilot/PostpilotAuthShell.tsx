"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RoughAnnotate } from "@/components/annotations/RoughAnnotate";
import PostpilotMark from "@/components/postpilot/PostpilotMark";

const ease = [0.22, 1, 0.36, 1] as const;
const SOFT = "#9ec0f5";

const perks = [
  "AI drafts with Gemini",
  "Smart queue for peak times",
  "Publish to X and LinkedIn",
];

type AuthVariant = "login" | "register" | "forgot";

const copy: Record<
  AuthVariant,
  { eyebrow: string; line1: string; mark: string; lead: ReactNode }
> = {
  login: {
    eyebrow: "Welcome back",
    line1: "Command your",
    mark: "timeline",
    lead: (
      <>
        Sign in to draft, schedule, and publish on X and{" "}
        <RoughAnnotate
          type="circle"
          color="#ffffff"
          strokeWidth={2}
          padding={[4, 10]}
          iterations={2}
          delay={1100}
        >
          LinkedIn
        </RoughAnnotate>
        . Instagram and more are on the way.
      </>
    ),
  },
  register: {
    eyebrow: "Get started free",
    line1: "Post on",
    mark: "autopilot",
    lead: (
      <>
        Create an account, connect X or{" "}
        <RoughAnnotate
          type="circle"
          color="#ffffff"
          strokeWidth={2}
          padding={[4, 10]}
          iterations={2}
          delay={1100}
        >
          LinkedIn
        </RoughAnnotate>
        , then schedule your first post in minutes.
      </>
    ),
  },
  forgot: {
    eyebrow: "Account recovery",
    line1: "Reset your",
    mark: "access",
    lead: (
      <>
        Enter the email on your Postpilot account and we&apos;ll send a reset
        link so you can get back to your queue.
      </>
    ),
  },
};

export default function PostpilotAuthShell({
  variant,
  children,
}: {
  variant: AuthVariant;
  children: React.ReactNode;
}) {
  const c = copy[variant];

  return (
    <div className="postpilot-root pp-login">
      <aside className="pp-login__brand" aria-label="Postpilot">
        <div className="pp-login__brand-wash" aria-hidden />
        <div className="pp-login__brand-grain" aria-hidden />

        <div className="pp-login__brand-inner">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <Link href="/" className="pp-login__logo">
              <PostpilotMark size={36} />
              <span>Postpilot</span>
            </Link>
          </motion.div>

          <div className="pp-login__brand-copy">
            <motion.p
              className="pp-login__eyebrow"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.06 }}
            >
              {c.eyebrow}
            </motion.p>

            <h1 className="pp-login__title">
              <span className="pp-login__line">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, ease }}
                >
                  {c.line1}
                </motion.span>
              </span>
              <span className="pp-login__line">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, ease, delay: 0.08 }}
                >
                  <RoughAnnotate
                    type="highlight"
                    color={SOFT}
                    strokeWidth={1.5}
                    padding={[2, 6]}
                    iterations={1}
                    delay={700}
                    animationDuration={900}
                  >
                    {c.mark}
                  </RoughAnnotate>
                  .
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="pp-login__lead"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.28 }}
            >
              {c.lead}
            </motion.p>

            {variant !== "forgot" ? (
              <ul className="pp-login__perks">
                {perks.map((perk, i) => (
                  <motion.li
                    key={perk}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.4 + i * 0.1 }}
                  >
                    {perk}
                  </motion.li>
                ))}
              </ul>
            ) : null}
          </div>

          <motion.p
            className="pp-login__foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Free to start · No credit card · X & LinkedIn
          </motion.p>
        </div>
      </aside>

      <main className="pp-login__panel">
        <div className="pp-login__panel-inner">{children}</div>
      </main>
    </div>
  );
}
