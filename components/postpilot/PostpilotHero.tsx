"use client";

import { motion } from "framer-motion";
import PostpilotMark from "@/components/postpilot/PostpilotMark";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotHero() {
  return (
    <section className="pp-hero" id="top" aria-labelledby="pp-hero-brand">
      <div className="pp-hero__wash" aria-hidden />
      <div className="pp-hero__grain" aria-hidden />

      <div className="pp-hero__inner">
        <motion.p
          id="pp-hero-brand"
          className="pp-hero__brand"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <PostpilotMark size={56} className="pp-hero__mark" />
          <span>Postpilot</span>
        </motion.p>

        <h1 className="pp-hero__title">
          <span className="pp-hero__line">
            <motion.span
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.85, ease }}
            >
              Connect your socials.
            </motion.span>
          </span>
          <span className="pp-hero__line">
            <motion.span
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.85, ease, delay: 0.08 }}
            >
              Schedule once.
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="pp-hero__sub"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.32 }}
        >
          Connect X, draft with AI, and schedule to your queue. Instagram,
          LinkedIn, and more are on the way.
        </motion.p>

        <motion.div
          className="pp-hero__cta flex !flex-row !flex-nowrap items-center justify-center gap-2 sm:gap-5"
          style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.42 }}
        >
          <a className="pp-btn pp-btn--dark" href="/register">
            Start free
          </a>
          <a className="pp-btn pp-btn--ghost" href="#how">
            <span className="pp-hero__cta-label-full">See how it works</span>
            <span className="pp-hero__cta-label-short">How it works</span>
          </a>
        </motion.div>
      </div>

      <div className="pp-hero__shotwrap">
        <motion.div
          className="pp-hero__shot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.45 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pp-hero__product-img"
            src="/postpilot/hero-dashboard.png"
            width={3200}
            height={1826}
            alt="Postpilot schedule dashboard showing calendar queue and posts for the day"
            decoding="async"
          />
        </motion.div>
      </div>

      <div className="pp-hero__fade" aria-hidden />
    </section>
  );
}
