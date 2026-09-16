import type { Metadata } from "next";
import { DM_Sans, Cairo, Newsreader } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Postpilot — Connect your socials. Schedule once.",
  description:
    "Link Instagram, LinkedIn, X, and more — then plan, approve, and publish from one calm queue.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${dmSans.variable} ${cairo.variable} ${newsreader.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
