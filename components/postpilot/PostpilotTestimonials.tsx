"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const quotes = [
  {
    body: "I stopped babysitting Buffer at midnight. Postpilot just hits the slot I picked.",
    name: "Amina K.",
    role: "Founder, Northstar",
  },
  {
    body: "Gemini drafts get me 80% there. I edit the last line and schedule. That’s the whole ritual now.",
    name: "Jordan Lee",
    role: "Writes @threadcraft",
  },
  {
    body: "The month view finally feels like a queue, not a spreadsheet wearing lipstick.",
    name: "Sam Rivera",
    role: "Growth lead",
  },
];

export default function PostpilotTestimonials() {
  return (
    <section
      className="pp-quotes"
      id="testimonials"
      aria-labelledby="pp-quotes-title"
    >
      <div className="pp-quotes__inner">
        <motion.p
          className="pp-quotes__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease }}
        >
          Testimonials
        </motion.p>
        <motion.h2
          id="pp-quotes-title"
          className="pp-quotes__title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          What early posters say.
        </motion.h2>

        <div className="pp-quotes__grid">
          {quotes.map((q, i) => (
            <motion.blockquote
              key={q.name}
              className="pp-quotes__card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease, delay: 0.08 + i * 0.08 }}
            >
              <p>“{q.body}”</p>
              <footer>
                <strong>{q.name}</strong>
                <span>{q.role}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
