"use client";

import { motion } from "framer-motion";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";

const ease = [0.22, 1, 0.36, 1] as const;

const creators = [
  { name: "@shipweekly", role: "Indie founder", platform: "x" as const },
  { name: "Maya Chen", role: "Product lead", platform: "linkedin" as const },
  { name: "@threadcraft", role: "Newsletter", platform: "x" as const },
  { name: "Northstar HQ", role: "SaaS team", platform: "linkedin" as const },
  { name: "@pixelops", role: "Design studio", platform: "x" as const },
  { name: "Jordan Lee", role: "Writer", platform: "linkedin" as const },
  { name: "@growthlab", role: "Agency", platform: "x" as const },
  { name: "Amina K.", role: "Founder", platform: "linkedin" as const },
  { name: "@buildinpublic", role: "Maker", platform: "x" as const },
  { name: "Draft Room", role: "Content studio", platform: "linkedin" as const },
  { name: "@quietqueue", role: "Creator", platform: "x" as const },
  { name: "Sam Rivera", role: "Growth lead", platform: "linkedin" as const },
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
          Founders, writers, and small teams who want one calm queue for X and
          LinkedIn — not five tabs and a sticky note.
        </motion.p>
      </div>

      <div className="pp-creators__marquee" aria-hidden>
        <div className="pp-creators__track">
          {loop.map((c, i) => (
            <div key={`${c.name}-${i}`} className="pp-creators__chip">
              <span
                className={[
                  "pp-creators__chip-mark",
                  c.platform === "linkedin"
                    ? "pp-creators__chip-mark--linkedin"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {c.platform === "linkedin" ? (
                  <FaLinkedinIn aria-hidden />
                ) : (
                  <SiX aria-hidden />
                )}
              </span>
              <div>
                <strong>{c.name}</strong>
                <em>{c.role}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
