"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

const ease = [0.22, 1, 0.36, 1] as const;

function acceptAll(): CookieConsentValue {
  return {
    essential: true,
    preferences: true,
    analytics: true,
    decidedAt: new Date().toISOString(),
    version: 1,
  };
}

function essentialOnly(): CookieConsentValue {
  return {
    essential: true,
    preferences: false,
    analytics: false,
    decidedAt: new Date().toISOString(),
    version: 1,
  };
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    setVisible(!existing);
    setReady(true);

    function onOpen() {
      setVisible(true);
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function save(next: CookieConsentValue) {
    writeCookieConsent(next);
    setVisible(false);
  }

  if (!ready) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[10000] flex justify-center p-3 sm:p-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="pp-cookie-title"
          aria-describedby="pp-cookie-desc"
        >
          <div className="pointer-events-auto relative w-full max-w-3xl rounded-xl border-2 border-primary bg-white p-4 pt-5 shadow-[0_18px_50px_rgba(43,109,207,0.14)] sm:p-5 sm:pt-6">
            <button
              type="button"
              onClick={() => save(essentialOnly())}
              className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              aria-label="Close and use essential cookies only"
            >
              <HiOutlineXMark className="size-5" />
            </button>

            <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pr-10">
              <div className="min-w-0 flex-1">
                <p
                  id="pp-cookie-title"
                  className="font-[family-name:var(--font-newsreader)] text-lg font-medium tracking-tight text-foreground"
                >
                  We use cookies
                </p>
                <p
                  id="pp-cookie-desc"
                  className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                >
                  Essential cookies keep you signed in. With your OK we also use
                  preferences and analytics cookies to improve Postpilot.{" "}
                  <Link
                    href="/cookies"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Cookie Policy
                  </Link>
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => save(essentialOnly())}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-primary/25 bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  Essential only
                </button>
                <button
                  type="button"
                  onClick={() => save(acceptAll())}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--pp-blue-deep)]"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Open the banner again (e.g. from footer “Manage cookies”). */
export function openCookieConsentBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
