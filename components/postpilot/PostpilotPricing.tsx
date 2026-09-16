"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Enough to connect X and feel the queue.",
    features: [
      "1 X account",
      "10 scheduled posts / month",
      "Compose + preview",
      "Basic calendar",
    ],
    cta: "Start free",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    blurb: "For creators who ship on a cadence.",
    features: [
      "Unlimited scheduled posts",
      "Gemini AI expands",
      "Month + week calendar",
      "Analytics snapshot",
      "Priority publish window",
    ],
    cta: "Go Pro",
    href: "/register",
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/ month",
    blurb: "Shared queue for small marketing crews.",
    features: [
      "Up to 5 seats",
      "Shared X workspace",
      "Approval-ready drafts",
      "Everything in Pro",
    ],
    cta: "Talk to us",
    href: "/register",
    featured: false,
  },
];

export default function PostpilotPricing() {
  return (
    <section className="pp-pricing" id="pricing" aria-labelledby="pp-pricing-title">
      <div className="pp-pricing__inner">
        <motion.p
          className="pp-pricing__eyebrow"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease }}
        >
          Pricing
        </motion.p>
        <motion.h2
          id="pp-pricing-title"
          className="pp-pricing__title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease, delay: 0.06 }}
        >
          Simple plans. Same calm queue.
        </motion.h2>
        <motion.p
          className="pp-pricing__sub"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          Start free on X. Upgrade when the cadence gets serious.
        </motion.p>

        <div className="pp-pricing__grid">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              className={`pp-pricing__card${plan.featured ? " pp-pricing__card--featured" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease, delay: 0.08 + i * 0.08 }}
            >
              {plan.featured ? (
                <span className="pp-pricing__badge">Most popular</span>
              ) : null}
              <h3>{plan.name}</h3>
              <p className="pp-pricing__price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </p>
              <p className="pp-pricing__blurb">{plan.blurb}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={
                  plan.featured ? "pp-btn pp-btn--primary" : "pp-btn pp-btn--ghost"
                }
              >
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
