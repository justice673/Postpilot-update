"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import PostpilotMark from "@/components/postpilot/PostpilotMark";

const NAV_LINKS = [
  { href: "#features", label: "Channels" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "/register", label: "Start free" },
];

const COMPANY_LINKS = [
  { href: "#creators", label: "Creators" },
  { href: "#testimonials", label: "Stories" },
  { href: "/login", label: "Log in" },
  { href: "/forgot-password", label: "Reset password" },
];

export default function PostpilotFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
    window.setTimeout(() => setDone(false), 2400);
  }

  return (
    <footer className="pp-footer">
      <div className="pp-footer__content">
        <div className="pp-footer__brand-row">
          <Link href="/" className="pp-footer__logo" aria-label="Postpilot home">
            <PostpilotMark size={36} />
            <span>Postpilot</span>
          </Link>
        </div>

        <div className="pp-footer__grid">
          <div className="pp-footer__subscribe">
            <h3>Subscribe</h3>
            <form className="pp-footer__form" onSubmit={onSubscribe}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email for updates"
              />
              <button type="submit" aria-label="Subscribe">
                <FiArrowRight />
              </button>
            </form>
            {done ? (
              <p className="pp-footer__form-ok">You’re on the list.</p>
            ) : (
              <p className="pp-footer__form-hint">
                Product notes when we ship new channels.
              </p>
            )}
          </div>

          <div className="pp-footer__link-cols">
            <div>
              <h4>Navigate</h4>
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
                <li>
                  <a href="mailto:hello@postpilot.app">Email</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="pp-footer__meta">
          Built for X creators · Schedule · AI drafts · Calm queue
        </p>

        <div className="pp-footer__wordmark-wrap">
          <p className="pp-footer__wordmark" aria-label="Postpilot">
            Postpilot
          </p>
        </div>

        <div className="pp-footer__base">
          <p>A quiet queue for people who post on purpose</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
