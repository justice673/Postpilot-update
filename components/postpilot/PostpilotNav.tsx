"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine, RiMenu4Fill } from "react-icons/ri";
import PostpilotMark from "@/components/postpilot/PostpilotMark";

const ease = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#creators", label: "Creators" },
  { href: "#pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
] as const;

export default function PostpilotNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <header className="pp-nav">
      <div className="pp-nav__inner">
        <Link href="/" className="pp-nav__brand" aria-label="Postpilot home">
          <PostpilotMark size={34} />
          <span>Postpilot</span>
        </Link>

        <nav className="pp-nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} className="pp-nav__link" href={link.href}>
              {link.label}
            </a>
          ))}
          <a className="pp-nav__cta" href="/register">
            Start free
          </a>
        </nav>

        <button
          type="button"
          className="pp-nav__menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="pp-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: 0.22, ease }}
              >
                <RiCloseLine size={26} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
                transition={{ duration: 0.22, ease }}
              >
                <RiMenu4Fill size={26} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="pp-nav__backdrop"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
            />
            <motion.nav
              id="pp-mobile-nav"
              className="pp-nav__drawer"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease }}
            >
              <ul className="pp-nav__drawer-list">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease, delay: 0.05 + i * 0.05 }}
                  >
                    <a href={link.href} onClick={close}>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 0.28 }}
              >
                <a
                  className="pp-nav__drawer-cta"
                  href="/register"
                  onClick={close}
                >
                  Start free
                </a>
              </motion.div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
