import type { Metadata } from "next";
import PostpilotLegalLayout from "@/components/postpilot/PostpilotLegalLayout";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Cookie Policy — Postpilot",
  description: "How Postpilot uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <PostpilotLegalLayout
      eyebrow="Legal"
      title="Cookie Policy"
      description="How we use cookies and similar technologies to keep you signed in and improve Postpilot."
      updated="September 17, 2026"
    >
      <section>
        <h2>1. What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device. We also use
          similar technologies such as local storage where needed for sessions.
        </p>
      </section>

      <section>
        <h2>2. How we use them</h2>
        <ul>
          <li>
            <strong>Essential.</strong> Sign-in sessions, security, and load
            balancing so the app works.
          </li>
          <li>
            <strong>Preferences.</strong> Remember settings like UI state where
            applicable.
          </li>
          <li>
            <strong>Analytics.</strong> Understand aggregate usage to improve
            the product (when enabled).
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Your control</h2>
        <p>
          Use the cookie banner when you first visit, or choose{" "}
          <strong>Manage cookies</strong> in the footer anytime to change your
          mind. Essential cookies stay on so sign-in keeps working. You can also
          block or delete cookies in your browser settings.
        </p>
      </section>

      <section>
        <h2>4. Updates</h2>
        <p>
          We may update this Cookie Policy as our practices change. Check the
          “Last updated” date on this page.
        </p>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p>
          Questions? Email{" "}
          <a href="mailto:hello@postpilot.app">hello@postpilot.app</a>.
        </p>
      </section>
    </PostpilotLegalLayout>
  );
}
