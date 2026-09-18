"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotChannels({
  tone = "wash",
}: {
  tone?: "wash" | "plain";
}) {
  return (
    <section
      className={["pp-channels", tone === "plain" ? "pp-channels--plain" : ""]
        .filter(Boolean)
        .join(" ")}
      id="features"
      aria-labelledby="pp-channels-title"
    >
      <div className="pp-channels__inner">
        <motion.p
          className="pp-channels__eyebrow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease }}
        >
          Channels
        </motion.p>

        <motion.h2
          id="pp-channels-title"
          className="pp-channels__title"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          X and LinkedIn are live.
          <br />
          More networks are next.
        </motion.h2>

        <motion.p
          className="pp-channels__sub"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease, delay: 0.12 }}
        >
          Schedule and publish to X and LinkedIn from one calm queue today.
          Instagram, TikTok, and YouTube are on the roadmap — same workflow when
          they land.
        </motion.p>

        <motion.div
          className="pp-channels__shot"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, ease, delay: 0.15 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pp-channels__img"
            src="/postpilot/channels-live.png"
            width={2198}
            height={1272}
            alt="Connected channels — X and LinkedIn connected; Instagram, TikTok, and YouTube coming soon"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>
  );
}
