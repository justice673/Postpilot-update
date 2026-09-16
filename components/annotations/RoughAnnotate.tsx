"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  createElement,
  ElementType,
} from "react";
import { annotate } from "rough-notation";
import "./sketch-annotate.css";

type RoughAnnotationInstance = ReturnType<typeof annotate>;

export type RoughType =
  | "underline"
  | "box"
  | "circle"
  | "highlight"
  | "strike-through"
  | "crossed-off"
  | "bracket";

type RoughAnnotateProps = {
  children: ReactNode;
  type?: RoughType;
  color?: string;
  strokeWidth?: number;
  padding?: number | [number, number] | [number, number, number, number];
  multiline?: boolean;
  animate?: boolean;
  animationDuration?: number;
  iterations?: number;
  brackets?:
    | "left"
    | "right"
    | "top"
    | "bottom"
    | Array<"left" | "right" | "top" | "bottom">;
  delay?: number;
  once?: boolean;
  as?: ElementType;
  className?: string;
};

/**
 * Viewport-triggered Rough Notation highlight.
 * @see https://roughnotation.com/
 */
export function RoughAnnotate({
  children,
  type = "underline",
  color = "#2b6dcf",
  strokeWidth = 2,
  padding = 2,
  multiline = type === "highlight" ||
    type === "underline" ||
    type === "strike-through",
  animate = true,
  animationDuration = 800,
  iterations = 2,
  brackets,
  delay = 120,
  once = true,
  as = "span",
  className = "",
}: RoughAnnotateProps) {
  const ref = useRef<HTMLElement | null>(null);
  const annotationRef = useRef<RoughAnnotationInstance | null>(null);
  const shownRef = useRef(false);
  const delayRef = useRef(delay);
  delayRef.current = delay;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let showTimer = 0;
    let layoutTimer = 0;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const destroy = () => {
      window.clearTimeout(showTimer);
      annotationRef.current?.remove();
      annotationRef.current = null;
    };

    const create = (withAnimate: boolean) => {
      destroy();
      const annotation = annotate(el, {
        type,
        color,
        strokeWidth,
        padding,
        multiline,
        animate: withAnimate,
        animationDuration,
        iterations,
        brackets,
      });
      annotationRef.current = annotation;
      return annotation;
    };

    const show = () => {
      if (once && shownRef.current) return;
      shownRef.current = true;
      showTimer = window.setTimeout(() => {
        if (cancelled) return;
        const annotation = create(animate);
        requestAnimationFrame(() => {
          if (!cancelled) annotation.show();
        });
      }, delayRef.current);
    };

    const reposition = () => {
      if (cancelled || !shownRef.current) return;
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(() => {
        if (cancelled || !shownRef.current) return;
        const annotation = create(false);
        annotation.show();
      }, 40);
    };

    const boot = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          io = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                show();
                if (once) io?.disconnect();
              } else if (!once) {
                annotationRef.current?.hide();
                shownRef.current = false;
              }
            },
            { threshold: 0.35 },
          );
          io.observe(el);

          const layoutRoot =
            el.closest(".annotation-showcase, main, body") ?? document.body;
          ro = new ResizeObserver(reposition);
          ro.observe(layoutRoot);
        });
      });
    };

    boot();
    window.addEventListener("resize", reposition);

    return () => {
      cancelled = true;
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", reposition);
      window.clearTimeout(layoutTimer);
      destroy();
      shownRef.current = false;
    };
  }, [
    type,
    color,
    strokeWidth,
    padding,
    multiline,
    animate,
    animationDuration,
    iterations,
    brackets,
    once,
  ]);

  return createElement(
    as,
    {
      ref,
      className: `sk-rough${multiline ? " sk-rough--multiline" : ""} ${className}`.trim(),
    },
    children,
  );
}
