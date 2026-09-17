import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./fonts-google.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postpilot — Connect your socials. Schedule once.",
  description:
    "Link Instagram, LinkedIn, X, and more — then plan, approve, and publish from one calm queue.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
