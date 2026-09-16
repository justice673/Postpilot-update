"use client";

import type { CSSProperties } from "react";
import { RoughAnnotate } from "@/components/annotations/RoughAnnotate";
import { SketchArrow } from "@/components/annotations/SketchArrow";
import "./sketch-annotate.css";

export type AnnotationTheme = {
  /** Primary stroke / highlight color (page brand) */
  accent: string;
  /** Softer fill for highlight marks */
  soft?: string;
  /** Optional ink override */
  ink?: string;
  /** Optional muted text */
  muted?: string;
  /** Optional surface / panel backgrounds */
  surface?: string;
  panel?: string;
};

type AnnotationShowcaseProps = {
  theme: AnnotationTheme;
  /** Small label above the title, e.g. page name */
  brand?: string;
};

/**
 * Demo strip of all rough annotations + sketch arrows,
 * tinted with each page's main brand color.
 */
export default function AnnotationShowcase({
  theme,
  brand = "Annotations",
}: AnnotationShowcaseProps) {
  const accent = theme.accent;
  const soft = theme.soft ?? accent;

  return (
    <section
      className="annotation-showcase"
      style={
        {
          ["--annotate-accent" as string]: accent,
          ["--annotate-soft" as string]: soft,
          ...(theme.ink ? { ["--annotate-ink" as string]: theme.ink } : null),
          ...(theme.muted
            ? { ["--annotate-muted" as string]: theme.muted }
            : null),
          ...(theme.surface
            ? { ["--annotate-surface" as string]: theme.surface }
            : null),
          ...(theme.panel
            ? { ["--annotate-panel" as string]: theme.panel }
            : null),
        } as CSSProperties
      }
      aria-label={`${brand} annotation samples`}
    >
      <div className="annotation-showcase__inner">
        <p className="annotation-showcase__eyebrow">{brand}</p>
        <h2 className="annotation-showcase__title">
          Hand-drawn marks for{" "}
          <RoughAnnotate
            type="circle"
            color={accent}
            strokeWidth={2}
            padding={[4, 10]}
            iterations={2}
            delay={200}
          >
            emphasis
          </RoughAnnotate>
        </h2>
        <p className="annotation-showcase__lead">
          Circles, highlights, underlines, boxes, brackets, and doodle arrows —
          all tinted with this page&apos;s brand color instead of generic orange.
        </p>

        <div className="annotation-showcase__grid">
          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Circle</p>
            <p className="annotation-showcase__sample">
              Book meetings with{" "}
              <RoughAnnotate
                type="circle"
                color={accent}
                strokeWidth={2}
                padding={[3, 8]}
                iterations={2}
                delay={280}
              >
                Calendly
              </RoughAnnotate>
            </p>
          </article>

          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Highlight</p>
            <p className="annotation-showcase__sample">
              Get the{" "}
              <RoughAnnotate
                type="highlight"
                color={soft}
                strokeWidth={1}
                padding={[2, 4]}
                iterations={1}
                delay={360}
                multiline
              >
                busywork done
              </RoughAnnotate>{" "}
              with fewer tools.
            </p>
          </article>

          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Underline</p>
            <p className="annotation-showcase__sample">
              <RoughAnnotate
                type="underline"
                color={accent}
                strokeWidth={2}
                padding={[0, 2]}
                iterations={2}
                delay={440}
              >
                Real customers. Real results.
              </RoughAnnotate>
            </p>
          </article>

          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Box</p>
            <p className="annotation-showcase__sample">
              Ship the{" "}
              <RoughAnnotate
                type="box"
                color={accent}
                strokeWidth={2}
                padding={6}
                iterations={2}
                delay={520}
              >
                first viewport
              </RoughAnnotate>{" "}
              as one composition.
            </p>
          </article>

          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Bracket</p>
            <p className="annotation-showcase__sample">
              <RoughAnnotate
                type="bracket"
                color={accent}
                strokeWidth={2}
                padding={6}
                brackets={["left", "right"]}
                iterations={1}
                delay={600}
              >
                Product · Solutions · Pricing
              </RoughAnnotate>
            </p>
          </article>

          <article className="annotation-showcase__card">
            <p className="annotation-showcase__label">Strike-through</p>
            <p className="annotation-showcase__sample">
              Skip the{" "}
              <RoughAnnotate
                type="strike-through"
                color={accent}
                strokeWidth={2}
                padding={2}
                iterations={1}
                delay={680}
              >
                endless email chains
              </RoughAnnotate>
              .
            </p>
          </article>

          <article className="annotation-showcase__card annotation-showcase__card--wide">
            <p className="annotation-showcase__label">Sketch arrows</p>
            <div className="annotation-showcase__arrows">
              <SketchArrow
                label="Start here"
                variant="loop-down-left"
                color={accent}
                width={130}
                height={110}
              />
              <SketchArrow
                label="Try this"
                variant="loop-up-left"
                color={accent}
                width={130}
                height={110}
              />
              <SketchArrow
                label="Next step"
                variant="loop-down-right"
                color={accent}
                width={130}
                height={110}
              />
              <SketchArrow
                label="Keep going →"
                variant="swoosh-right"
                color={accent}
                width={150}
                height={100}
              />
            </div>
          </article>
        </div>

        <p className="annotation-showcase__footer">
          Hover nothing required — marks draw when this section scrolls into
          view. Color comes from{" "}
          <RoughAnnotate
            type="underline"
            color={accent}
            strokeWidth={1.75}
            padding={[0, 2]}
            iterations={1}
            delay={900}
          >
            {brand}
          </RoughAnnotate>
          .
        </p>
      </div>
    </section>
  );
}
