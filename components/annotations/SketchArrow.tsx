"use client";

import { CSSProperties } from "react";
import "./sketch-annotate.css";

export type SketchArrowVariant =
  | "loop-down-left"
  | "loop-up-left"
  | "loop-down-right"
  | "swoosh-right";

type SketchArrowProps = {
  label?: string;
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  variant?: SketchArrowVariant;
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
};

const PATHS: Record<SketchArrowVariant, string> = {
  "loop-down-left":
    "M 96 22 C 128 10, 156 28, 148 52 C 140 74, 112 78, 98 62 C 86 48, 94 32, 112 30 C 126 28, 134 42, 126 56 C 112 84, 78 112, 42 132 M 42 132 L 62 124 M 42 132 L 50 112",
  "loop-up-left":
    "M 148 128 C 168 112, 170 84, 152 72 C 134 60, 116 74, 124 92 C 130 104, 146 106, 154 94 C 166 72, 148 42, 108 24 C 78 10, 40 16, 22 34 M 22 34 L 40 26 M 22 34 L 28 50",
  "loop-down-right":
    "M 84 22 C 52 10, 24 28, 32 52 C 40 74, 68 78, 82 62 C 94 48, 86 32, 68 30 C 54 28, 46 42, 54 56 C 68 84, 102 112, 138 132 M 138 132 L 118 124 M 138 132 L 130 112",
  "swoosh-right":
    "M 12 78 C 36 52, 58 98, 84 72 C 108 48, 128 92, 152 70 M 152 70 L 134 62 M 152 70 L 140 88",
};

/** Hand-drawn doodle arrow — pair with RoughAnnotate. */
export function SketchArrow({
  label,
  color = "#2b6dcf",
  width = 140,
  height = 120,
  strokeWidth = 2.2,
  variant = "loop-down-left",
  className = "",
  style,
  animate = true,
}: SketchArrowProps) {
  return (
    <div
      className={`sk-arrow ${animate ? "sk-arrow--animate" : ""} ${className}`}
      style={{ color, ...style }}
      aria-hidden={label ? undefined : true}
    >
      {label ? <p className="sk-arrow__label">{label}</p> : null}
      <svg
        className="sk-arrow__svg"
        width={width}
        height={height}
        viewBox="0 0 180 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={PATHS[variant]}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
