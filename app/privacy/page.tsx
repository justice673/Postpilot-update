import type { Metadata } from "next";
import PostpilotLegalLayout from "@/components/postpilot/PostpilotLegalLayout";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Postpilot",
  description: "How Postpilot collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <PostpilotLegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      description="How we collect, use, and protect information when you use Postpilot."
      updated="September 17, 2026"
    >
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains what information we collect, why we
          collect it, and how you can control it. By using Postpilot, you agree
          to this policy.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <p>
          <strong>Account data.</strong> Email address, display name, password
          (hashed by our auth provider), timezone, and profile details you
          choose to add.
        </p>
        <p>
          <strong>Connected accounts.</strong> Tokens and profile identifiers
          from networks you connect (such as X), used only to publish and manage
          posts on your behalf.
        </p>
        <p>
          <strong>Content.</strong> Drafts, scheduled posts, images you upload,
          and related metadata needed to run the queue.
        </p>
        <p>
          <strong>Usage data.</strong> Approximate device/browser info, IP
          address, and product analytics that help us improve reliability.
        </p>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide scheduling, publishing, and account features</li>
          <li>Send transactional email (confirmations, publish alerts) when enabled</li>
          <li>Improve product performance and fix issues</li>
          <li>Enforce our Terms and protect the service</li>
        </ul>
      </section>

      <section>
        <h2>4. AI features</h2>
        <p>
          If you use AI writing, your prompt may be sent to our AI provider to
          generate a draft. Do not include sensitive personal data in prompts
          you would not want processed for that purpose.
        </p>
      </section>

      <section>
        <h2>5. Sharing</h2>
        <p>
          We do not sell your personal information. We share data with service
          providers that help us operate Postpilot (hosting, auth, email, AI)
          under appropriate safeguards, and when required by law.
        </p>
        <p>
          Content you schedule is shared with the social platforms you choose to
          publish to, under those platforms’ policies.
        </p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We keep account and content data while your account is active and as
          needed for the service. You may delete posts or request account
          deletion from account settings.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use industry-standard measures such as encrypted transport and
          scoped OAuth tokens. No method of transmission or storage is 100%
          secure.
        </p>
      </section>

      <section>
        <h2>8. Your choices</h2>
        <p>
          You can update profile details, notification preferences, disconnect
          social accounts, and delete your account from the product. Contact us
          if you need help exercising access or deletion requests.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          Postpilot is not directed to children under 13 (or the minimum age
          required in your region). We do not knowingly collect their personal
          information.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last
          updated” date at the top of this page will change when we do.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Privacy questions? Email{" "}
          <a href="mailto:hello@postpilot.app">hello@postpilot.app</a>.
        </p>
      </section>
    </PostpilotLegalLayout>
  );
}
