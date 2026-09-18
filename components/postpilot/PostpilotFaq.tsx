"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";

const ease = [0.22, 1, 0.36, 1] as const;

const faqs = [
  {
    question: "Is Postpilot free to start?",
    answer:
      "Yes. The Free plan includes one connected channel and 10 scheduled posts per month — enough to connect X or LinkedIn, compose, and feel the queue before you upgrade.",
  },
  {
    question: "Which social networks are supported?",
    answer:
      "X and LinkedIn are live today. Instagram, TikTok, and YouTube are on the roadmap. When they ship, they’ll use the same calm queue you already know.",
  },
  {
    question: "How does AI writing work?",
    answer:
      "Drop a short prompt and Gemini expands it into a draft you can edit. AI writing can be toggled per workspace, and you always review before anything goes live.",
  },
  {
    question: "Can I schedule posts in my own timezone?",
    answer:
      "Yes. Set your timezone in account settings and the calendar, countdowns, and publish windows follow that zone.",
  },
  {
    question: "What happens if a post fails to publish?",
    answer:
      "Failed posts show up in your schedule and notifications so you can fix the issue and reschedule. Optional email alerts are available in notification settings.",
  },
  {
    question: "How do I disconnect a social account?",
    answer:
      "Open Settings, choose the connected channel (X or LinkedIn), and confirm disconnect. You can reconnect anytime with OAuth — we never ask for your password.",
  },
];

export default function PostpilotFaq() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section className="pp-faq" id="faq" aria-labelledby="pp-faq-title">
      <div className="pp-faq__inner">
        <motion.p
          className="pp-faq__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease }}
        >
          FAQ
        </motion.p>
        <motion.h2
          id="pp-faq-title"
          className="pp-faq__title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          Questions, answered.
        </motion.h2>
        <motion.p
          className="pp-faq__sub"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Quick answers about plans, channels, AI drafts, and publishing.
        </motion.p>

        <div className="pp-faq__list">
          {faqs.map((item, index) => {
            const open = openId === index;
            return (
              <motion.div
                key={item.question}
                className={["pp-faq__item", open ? "pp-faq__item--open" : ""]
                  .filter(Boolean)
                  .join(" ")}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease, delay: 0.04 * index }}
              >
                <button
                  type="button"
                  className="pp-faq__trigger"
                  aria-expanded={open}
                  aria-controls={`pp-faq-panel-${index}`}
                  id={`pp-faq-trigger-${index}`}
                  onClick={() => setOpenId(open ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="pp-faq__icon" aria-hidden>
                    <AnimatePresence mode="wait" initial={false}>
                      {open ? (
                        <motion.span
                          key="minus"
                          initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                          transition={{ duration: 0.22, ease }}
                        >
                          <HiOutlineMinus size={22} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="plus"
                          initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                          animate={{ opacity: 1, rotate: 0, scale: 1 }}
                          exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                          transition={{ duration: 0.22, ease }}
                        >
                          <HiOutlinePlus size={22} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={`pp-faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`pp-faq-trigger-${index}`}
                      className="pp-faq__panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
