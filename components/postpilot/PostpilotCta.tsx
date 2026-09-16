"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PostpilotCta() {
  return (
    <section className="pp-cta" aria-labelledby="pp-cta-title">
      <motion.div
        className="pp-cta__panel"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="pp-cta__bg" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/postpilot/cta/cta-wash.jpg?v=4"
            alt=""
            className="pp-cta__bg-img"
          />
          <div className="pp-cta__bg-shade" />
        </div>

        <div className="pp-cta__row">
          <h2 id="pp-cta-title">
            Start scheduling
            <br />
            with Postpilot
          </h2>
          <Link href="/register" className="pp-cta__btn">
            Get started free
            <FiChevronRight aria-hidden />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
