import type { Metadata } from "next";
import PostpilotLegalLayout from "@/components/postpilot/PostpilotLegalLayout";
import "../postpilot.css";

export const metadata: Metadata = {
  title: "Terms of Service — Postpilot",
  description: "Terms and conditions for using Postpilot.",
};

export default function TermsPage() {
  return (
    <PostpilotLegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      description="The ground rules for using Postpilot to connect accounts, schedule posts, and publish to supported networks."
      updated="September 17, 2026"
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          By creating an account or using Postpilot, you agree to these Terms of
          Service and our Privacy Policy. If you do not agree, do not use the
          service.
        </p>
      </section>

      <section>
        <h2>2. The service</h2>
        <p>
          Postpilot helps you compose, schedule, and publish posts to supported
          social networks (including X and LinkedIn today), with optional
          AI-assisted drafting. Features may change as we ship updates.
        </p>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          You are responsible for keeping your login credentials secure and for
          activity under your account. Provide accurate information and tell us
          promptly if you suspect unauthorized access.
        </p>
      </section>

      <section>
        <h2>4. Connected platforms</h2>
        <p>
          When you connect X, LinkedIn, or another network, you authorize
          Postpilot to act using the permissions you grant via OAuth. You must
          comply with that platform’s terms. We do not ask for your social
          network password.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          You retain ownership of content you create or upload. You grant us a
          limited license to store, process, and publish that content as needed
          to operate the service you request (for example, scheduling a post).
        </p>
        <p>
          You are solely responsible for what you publish. Do not use Postpilot
          for illegal, harmful, or infringing content.
        </p>
      </section>

      <section>
        <h2>6. Plans and billing</h2>
        <p>
          Free and paid plans may include usage limits. Paid features renew
          according to the plan you choose until canceled. Fees are
          non-refundable except where required by law.
        </p>
      </section>

      <section>
        <h2>7. Acceptable use</h2>
        <p>
          Do not abuse the service, attempt to disrupt it, scrape it without
          permission, reverse engineer it, or use it to spam or violate platform
          rules.
        </p>
      </section>

      <section>
        <h2>8. Availability</h2>
        <p>
          We aim for reliable uptime but do not guarantee uninterrupted service.
          Scheduled posts may fail due to platform outages, revoked tokens, or
          content rejections by the network.
        </p>
      </section>

      <section>
        <h2>9. Disclaimers</h2>
        <p>
          Postpilot is provided “as is.” To the fullest extent permitted by law,
          we disclaim warranties of merchantability, fitness for a particular
          purpose, and non-infringement.
        </p>
      </section>

      <section>
        <h2>10. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Postpilot and its operators
          are not liable for indirect, incidental, special, consequential, or
          punitive damages, or for lost profits, data, or goodwill arising from
          your use of the service.
        </p>
      </section>

      <section>
        <h2>11. Changes</h2>
        <p>
          We may update these Terms. Continued use after changes become
          effective means you accept the updated Terms. Material changes will be
          reflected by the “Last updated” date on this page.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:hello@postpilot.app">hello@postpilot.app</a>.
        </p>
      </section>
    </PostpilotLegalLayout>
  );
}
