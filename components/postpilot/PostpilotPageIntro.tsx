"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotPageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="pp-page-intro">
      <div className="pp-page-intro__inner">
        <motion.p
          className="pp-page-intro__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className="pp-page-intro__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="pp-page-intro__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.12 }}
        >
          {description}
        </motion.p>
      </div>
    </header>
  );
}
