"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    id: "connect",
    title: "Connect a channel",
    body: "Secure OAuth for X or LinkedIn in under a minute. We only take the publish permissions we need — never your password.",
    image: "/postpilot/how-connect.png",
    alt: "Connected channels settings with X and LinkedIn connected, more networks coming soon",
  },
  {
    id: "compose",
    title: "Compose or expand",
    body: "Write it yourself, or drop a prompt and let Gemini draft the post. Add images, pick X or LinkedIn, then preview how it lands.",
    image: "/postpilot/how-compose.png",
    alt: "Compose editor with draft, images, schedule controls, and live preview for X or LinkedIn",
  },
  {
    id: "schedule",
    title: "Schedule or ship",
    body: "Post now, or park it on your calendar. Drag to reschedule, watch the countdown, and let Postpilot hit publish.",
    image: "/postpilot/how-schedule.png",
    alt: "Schedule week view with published, failed, and upcoming posts in the queue",
  },
] as const;

const ITEM_GAP = 44;

function StepVisual({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="pp-how__shot" src={image} alt={alt} decoding="async" />
  );
}

function MobileHow() {
  return (
    <div className="pp-how__mobile">
      {steps.map((step) => (
        <article key={step.id} className="pp-how__mobile-card">
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <div className="pp-how__mobile-shot">
            <StepVisual image={step.image} alt={step.alt} />
          </div>
        </article>
      ))}
    </div>
  );
}

function StickyHow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const last = steps.length - 1;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.72,
    restDelta: 5e-4,
  });

  const pillY = useTransform(progress, [0, 1], [0, last * ITEM_GAP]);

  useMotionValueEvent(progress, "change", (p) => {
    const next = Math.min(last, Math.max(0, Math.round(p * last)));
    setActive((prev) => (prev === next ? prev : next));
  });

  function jumpTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const travel = el.offsetHeight - window.innerHeight;
    const y = top + travel * (index / last);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div ref={trackRef} className="pp-how__scroller">
      <div className="pp-how__sticky">
        <aside className="pp-how__nav" aria-label="How it works steps">
          <div className="pp-how__nav-track" aria-hidden>
            <motion.span className="pp-how__nav-pill" style={{ y: pillY }} />
          </div>
          <ul className="pp-how__nav-list">
            {steps.map((step, i) => (
              <li key={step.id}>
                <button
                  type="button"
                  className={
                    i === active
                      ? "pp-how__nav-btn is-active"
                      : "pp-how__nav-btn"
                  }
                  onClick={() => jumpTo(i)}
                >
                  {step.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="pp-how__stage">
          <div className="pp-how__stage-frame">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                className="pp-how__stage-panel"
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  y: i === active ? 0 : i < active ? -14 : 14,
                  scale: i === active ? 1 : 0.985,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ pointerEvents: i === active ? "auto" : "none" }}
              >
                <StepVisual image={step.image} alt={step.alt} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pp-how__copy">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[active].id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="pp-how__copy-kicker">
                Step {String(active + 1).padStart(2, "0")}
              </p>
              <h3 className="pp-how__copy-title">{steps[active].title}</h3>
              <p className="pp-how__copy-body">{steps[active].body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function PostpilotHow() {
  const reduce = useReducedMotion() ?? false;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section className="pp-how" id="how" aria-labelledby="pp-how-title">
      <div className="pp-how__inner">
        <p className="pp-how__eyebrow">How it works</p>
        <h2 id="pp-how-title" className="pp-how__title">
          Idea to timeline
          <br />
          in three moves.
        </h2>
        <p className="pp-how__sub">
          No enterprise maze. Connect once, write or generate, then schedule —
          Postpilot handles the rest.
        </p>

        {reduce || !isDesktop ? <MobileHow /> : <StickyHow />}
      </div>
    </section>
  );
}
