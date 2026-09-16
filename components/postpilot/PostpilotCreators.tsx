"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const creators = [
  { handle: "@shipweekly", role: "Indie founder" },
  { handle: "@threadcraft", role: "Newsletter" },
  { handle: "@pixelops", role: "Design studio" },
  { handle: "@growthlab", role: "Agency" },
  { handle: "@buildinpublic", role: "Maker" },
  { handle: "@quietqueue", role: "Creator" },
  { handle: "@northstarhq", role: "SaaS team" },
  { handle: "@draftroom", role: "Writer" },
];

export default function PostpilotCreators() {
  const loop = [...creators, ...creators];

  return (
    <section className="pp-creators" id="creators" aria-labelledby="pp-creators-title">
      <div className="pp-creators__inner">
        <motion.p
          className="pp-creators__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease }}
        >
          Creators
        </motion.p>
        <motion.h2
          id="pp-creators-title"
          className="pp-creators__title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          Built for people who post on purpose.
        </motion.h2>
        <motion.p
          className="pp-creators__sub"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Founders, writers, and small teams who want a calm X queue — not five
          tabs and a sticky note.
        </motion.p>
      </div>

      <div className="pp-creators__marquee" aria-hidden>
        <div className="pp-creators__track">
          {loop.map((c, i) => (
            <div key={`${c.handle}-${i}`} className="pp-creators__chip">
              <span className="pp-creators__chip-mark">𝕏</span>
              <div>
                <strong>{c.handle}</strong>
                <em>{c.role}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
