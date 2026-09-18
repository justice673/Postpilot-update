import type { Metadata } from "next";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { Toaster } from "@/components/ui/sonner";
import "./fonts-google.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postpilot — Connect your socials. Schedule once.",
  description:
    "Link X and LinkedIn today — then plan, approve, and publish from one calm queue. More networks on the way.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr">
      <body>
        {children}
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
