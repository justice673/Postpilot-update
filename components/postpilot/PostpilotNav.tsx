"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine, RiMenu4Fill } from "react-icons/ri";
import PostpilotMark from "@/components/postpilot/PostpilotMark";

const ease = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/creators", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
] as const;

const drawerVariants = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease,
      when: "beforeChildren" as const,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    transition: {
      duration: 0.32,
      ease,
      when: "afterChildren" as const,
      staggerChildren: 0.045,
      staggerDirection: -1 as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.22, ease },
  },
};

export default function PostpilotNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

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

  useEffect(() => {
    function onScroll() {
      setStuck(window.scrollY > 28);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function close() {
    setOpen(false);
  }

  function isActive(href: string) {
    if (href === "/login") return pathname === "/login";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navClass = [
    "pp-nav",
    open ? "pp-nav--open" : "",
    stuck ? "pp-nav--stuck" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={navClass}>
      <div className="pp-nav__inner">
        <Link href="/" className="pp-nav__brand" aria-label="Postpilot home">
          <PostpilotMark size={34} />
          <span>Postpilot</span>
        </Link>

        <nav className="pp-nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              className={[
                "pp-nav__link",
                isActive(link.href) ? "pp-nav__link--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link className="pp-nav__cta" href="/register">
            Start free
          </Link>
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
          <motion.nav
            key="pp-mobile-nav"
            id="pp-mobile-nav"
            className="pp-nav__drawer"
            aria-label="Mobile"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ul className="pp-nav__drawer-list">
              {LINKS.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link href={link.href} onClick={close}>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div variants={itemVariants}>
              <Link
                className="pp-nav__drawer-cta"
                href="/register"
                onClick={close}
              >
                Start free
              </Link>
            </motion.div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
