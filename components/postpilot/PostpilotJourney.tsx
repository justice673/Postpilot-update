"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

type Stage = {
  id: "landscape" | "portrait";
  width: number;
  height: number;
  cardWidth: number;
  size: string;
  titleClass: string;
  labelClass: string;
};

const LANDSCAPE: Stage = {
  id: "landscape",
  width: 1440,
  height: 830,
  cardWidth: 20.833333,
  size: "min(100vw, calc(100dvh * 1.73494), 90rem)",
  titleClass: "pp-journey__title--landscape",
  labelClass: "pp-journey__label--landscape",
};

const PORTRAIT: Stage = {
  id: "portrait",
  width: 390,
  height: 720,
  cardWidth: 44,
  size: "min(100vw, calc(100dvh * 0.541667))",
  titleClass: "pp-journey__title--portrait",
  labelClass: "pp-journey__label--portrait",
};

type CardDef = {
  id: string;
  color?: string;
  label?: string;
  image?: string;
  landscape: { x: number; y: number };
  portrait: { x: number; y: number };
  zIndex: number;
};

const CARDS: CardDef[] = [
  {
    id: "connect",
    color: "#2b6dcf",
    label: "Connect",
    landscape: { x: 986, y: -85 },
    portrait: { x: 215, y: -75 },
    zIndex: 1,
  },
  {
    id: "compose-shot",
    image: "/postpilot/how-compose.png",
    landscape: { x: 140, y: -45 },
    portrait: { x: 10, y: -60 },
    zIndex: 2,
  },
  {
    id: "compose",
    color: "#f76824",
    label: "Compose",
    landscape: { x: -66, y: 351 },
    portrait: { x: -60, y: 285 },
    zIndex: 3,
  },
  {
    id: "queue-shot",
    image: "/postpilot/how-schedule.png",
    landscape: { x: 414, y: 601 },
    portrait: { x: 25, y: 600 },
    zIndex: 4,
  },
  {
    id: "publish",
    color: "#9e45cb",
    label: "Publish",
    landscape: { x: 1081, y: 505 },
    portrait: { x: 210, y: 495 },
    zIndex: 5,
  },
];

function CardMedia({ card, stage }: { card: CardDef; stage: Stage }) {
  if (card.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="pp-journey__photo"
        src={card.image}
        alt=""
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <span className={`pp-journey__label ${stage.labelClass}`}>{card.label}</span>
  );
}

function JourneyCard({
  card,
  progress,
  stage,
}: {
  card: CardDef;
  progress: MotionValue<number>;
  stage: Stage;
}) {
  const cardW = (stage.width * stage.cardWidth) / 100;
  const cardH = cardW * 0.9;
  const end = {
    x: (stage.width - cardW) / 2,
    y: (stage.height - cardH) / 2,
  };
  const start = card[stage.id];

  const x = useTransform(
    progress,
    [0, 1],
    [`${((start.x - end.x) / cardW) * 100}%`, "0%"],
    { ease: easeInOutQuad },
  );
  const y = useTransform(
    progress,
    [0, 1],
    [`${((start.y - end.y) / cardH) * 100}%`, "0%"],
    { ease: easeInOutQuad },
  );

  return (
    <motion.div
      aria-hidden
      className="pp-journey__card"
      style={{
        backgroundColor: card.color ?? "#ffffff",
        left: `${(end.x / stage.width) * 100}%`,
        top: `${(end.y / stage.height) * 100}%`,
        width: `${stage.cardWidth}%`,
        x,
        y,
        zIndex: card.zIndex,
      }}
    >
      <CardMedia card={card} stage={stage} />
    </motion.div>
  );
}

function StaticGrid() {
  return (
    <div className="pp-journey__static">
      <h2 className="pp-journey__static-title">From draft to live</h2>
      <div className="pp-journey__static-grid">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="pp-journey__static-card"
            style={{ backgroundColor: card.color ?? "#ffffff" }}
            aria-hidden
          >
            {card.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pp-journey__photo" src={card.image} alt="" />
            ) : (
              <span>{card.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StickyJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState<Stage>(LANDSCAPE);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setStage(mq.matches ? LANDSCAPE : PORTRAIT);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 10vh", "end 50vh"],
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.8, 0.85, 1],
    [1, 1, 0, 0],
  );

  return (
    <section
      ref={trackRef}
      className="pp-journey pp-journey--sticky"
      id="journey"
      aria-labelledby="pp-journey-title"
    >
      <div className="pp-journey__pin">
        <div
          className="pp-journey__stage"
          style={{
            width: stage.size,
            aspectRatio: `${stage.width} / ${stage.height}`,
          }}
        >
          <motion.h2
            id="pp-journey-title"
            className={`pp-journey__title ${stage.titleClass}`}
            style={{ opacity: titleOpacity, scale: titleScale }}
          >
            From draft to live
          </motion.h2>

          {CARDS.map((card) => (
            <JourneyCard
              key={card.id}
              card={card}
              progress={scrollYProgress}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PostpilotJourney() {
  const reduce = useReducedMotion() ?? false;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || reduce) {
    return (
      <section className="pp-journey" id="journey" aria-labelledby="pp-journey-title">
        <StaticGrid />
      </section>
    );
  }

  return <StickyJourney />;
}
