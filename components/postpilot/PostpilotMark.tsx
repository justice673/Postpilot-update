import { GiVineLeaf } from "react-icons/gi";
import { cn } from "@/lib/utils";

type PostpilotMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * App mark: white rounded square, soft blue edge, blue vine leaf.
 */
export default function PostpilotMark({
  size = 32,
  className,
  title = "Postpilot",
}: PostpilotMarkProps) {
  const border = Math.max(2, Math.round(size * 0.06));
  const iconSize = Math.round(size * 0.5);
  const radius = Math.round(size * 0.28);

  return (
    <span
      title={title}
      aria-label={title}
      role="img"
      className={cn(
        "inline-flex shrink-0 items-center justify-center border-solid border-[#cfe0fb] bg-white text-[#2b6dcf]",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderRadius: radius,
      }}
    >
      <GiVineLeaf size={iconSize} aria-hidden />
    </span>
  );
}
