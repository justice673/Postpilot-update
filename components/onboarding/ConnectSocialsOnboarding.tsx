"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaTiktok } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { RiInstagramFill } from "react-icons/ri";
import { SiX, SiYoutube } from "react-icons/si";
import PostpilotMark from "@/components/postpilot/PostpilotMark";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type Network = {
  id: string;
  name: string;
  blurb: string;
  status: "live" | "soon";
  Icon: React.ComponentType<{ className?: string }>;
  markClass: string;
};

const networks: Network[] = [
  {
    id: "x",
    name: "X",
    blurb: "Live now — connect to publish",
    status: "live",
    Icon: SiX,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "instagram",
    name: "Instagram",
    blurb: "Coming soon",
    status: "soon",
    Icon: RiInstagramFill,
    markClass:
      "bg-[linear-gradient(135deg,#f58529,#dd2a7b,#8134af)] text-white",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    blurb: "Coming soon",
    status: "soon",
    Icon: FaLinkedinIn,
    markClass: "bg-[#0a66c2] text-white",
  },
  {
    id: "tiktok",
    name: "TikTok",
    blurb: "Coming soon",
    status: "soon",
    Icon: FaTiktok,
    markClass: "bg-[#111111] text-white",
  },
  {
    id: "youtube",
    name: "YouTube",
    blurb: "Coming soon",
    status: "soon",
    Icon: SiYoutube,
    markClass: "bg-[#ff0000] text-white",
  },
];

export default function ConnectSocialsOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string | null>("x");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  async function connectSelected() {
    if (selected !== "x") return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 900));
    setConnected(true);
    setConnecting(false);
    setStep(2);
  }

  function continueFlow() {
    if (step === 1) {
      if (selected === "x" && !connected) {
        void connectSelected();
        return;
      }
      setStep(2);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="postpilot-root flex min-h-dvh flex-col bg-[linear-gradient(180deg,#cfe0fb55_0%,#ffffff_32%,#ffffff_100%)] text-[#111111]">
      <header className="flex items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-[family-name:var(--font-newsreader)] text-xl font-medium tracking-tight text-[#2b6dcf]"
        >
          <PostpilotMark size={30} />
          Postpilot
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-[#525252] transition-colors hover:text-[#2b6dcf]"
        >
          Skip for now →
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-10 md:px-8">
        <div className="mb-8 flex items-center justify-center gap-3" aria-label="Onboarding progress">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                  step === n
                    ? "bg-[#2b6dcf] text-white"
                    : step > n
                      ? "bg-[#2b6dcf]/20 text-[#1e4f9a]"
                      : "bg-[#eef4fc] text-[#525252]",
                )}
              >
                {n}
              </span>
              {n === 1 ? (
                <span
                  className={cn(
                    "h-px w-10 sm:w-16",
                    step > 1 ? "bg-[#2b6dcf]" : "bg-[#dbe7f8]",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="flex flex-1 flex-col"
          >
            <div className="mx-auto max-w-xl text-center">
              <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight sm:text-4xl">
                Connect your socials
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#525252]">
                X is live today. Pick it to connect — Instagram, LinkedIn, and
                more are on the way.
              </p>
            </div>

            <div className="mx-auto mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              {networks.map((network, i) => {
                const isSelected = selected === network.id;
                const disabled = network.status === "soon";
                return (
                  <motion.button
                    key={network.id}
                    type="button"
                    disabled={disabled}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease, delay: 0.05 + i * 0.05 }}
                    onClick={() => setSelected(network.id)}
                    className={cn(
                      "relative flex flex-col items-center rounded-2xl border bg-white px-5 py-7 text-center transition-all",
                      disabled
                        ? "cursor-not-allowed border-[#e8eef8] opacity-70"
                        : isSelected
                          ? "border-[#2b6dcf] shadow-[0_0_0_3px_rgba(43,109,207,0.16)]"
                          : "border-[#dbe7f8] hover:border-[#5595f3]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute right-3 top-3 size-4 rounded-full border-2",
                        isSelected && !disabled
                          ? "border-[#2b6dcf] bg-[#2b6dcf]"
                          : "border-[#c9d7ec] bg-transparent",
                      )}
                    />
                    <span
                      className={cn(
                        "mb-4 flex size-14 items-center justify-center rounded-2xl",
                        network.markClass,
                      )}
                    >
                      <network.Icon className="size-6" />
                    </span>
                    <span className="text-base font-semibold tracking-tight">
                      {network.name}
                    </span>
                    <span className="mt-1 text-xs font-medium text-[#525252]">
                      {network.blurb}
                    </span>
                    {network.status === "soon" ? (
                      <span className="mt-3 rounded-md bg-[#eef4fc] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e4f9a]">
                        Soon
                      </span>
                    ) : connected ? (
                      <span className="mt-3 rounded-md bg-[#e8f8ef] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                        Connected
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}

              <div className="relative flex flex-col items-center rounded-2xl border border-dashed border-[#c9d7ec] bg-[#f7faff] px-5 py-7 text-center sm:col-span-2">
                <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-[#2b6dcf] ring-1 ring-[#dbe7f8]">
                  <FiPlus className="size-6" />
                </span>
                <span className="text-base font-semibold tracking-tight">
                  More networks
                </span>
                <span className="mt-1 text-xs font-medium text-[#525252]">
                  We’re lining up the next channels for your queue
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center text-center"
          >
            <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#111111] text-white">
              <SiX className="size-7" />
            </span>
            <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight sm:text-4xl">
              {connected ? "X is connected." : "You’re ready to draft."}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#525252]">
              {connected
                ? "Head to your dashboard to compose, expand with AI, and schedule your first post."
                : "You can connect X anytime from Settings. Your queue is waiting."}
            </p>
          </motion.div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#dbe7f8] bg-white px-4 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f7faff]"
              >
                <FiChevronLeft className="size-4" />
                Back
              </button>
            ) : (
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#dbe7f8] bg-white px-4 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f7faff]"
              >
                <FiChevronLeft className="size-4" />
                Back
              </Link>
            )}
            <button
              type="button"
              onClick={continueFlow}
              disabled={connecting || (step === 1 && !selected)}
              className="inline-flex h-11 items-center gap-1.5 rounded-md bg-[#2b6dcf] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f9a] disabled:cursor-wait disabled:opacity-70"
            >
              {connecting
                ? "Connecting…"
                : step === 1 && selected === "x" && !connected
                  ? "Connect X"
                  : step === 1
                    ? "Continue"
                    : "Go to dashboard"}
              {!connecting ? <FiChevronRight className="size-4" /> : null}
            </button>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#525252] hover:text-[#2b6dcf]"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
