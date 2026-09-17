import "server-only";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export class EmailServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "EmailServiceError";
  }
}

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let cachedTransporter: Transporter | null = null;

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export function isEmailConfigured(): boolean {
  return smtpConfigured();
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "Postpilot <noreply@localhost>"
  );
}

function getTransporter(): Transporter {
  if (!smtpConfigured()) {
    throw new EmailServiceError(
      "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      "NOT_CONFIGURED",
    );
  }

  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

/** Send a transactional email. No-ops (logs) when SMTP is not configured. */
export async function sendMail(payload: MailPayload): Promise<boolean> {
  if (!smtpConfigured()) {
    console.warn(
      "[email] SMTP not configured — skipped:",
      payload.subject,
      "→",
      payload.to,
    );
    return false;
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? `<pre style="font-family:sans-serif">${escapeHtml(payload.text)}</pre>`,
    });
    return true;
  } catch (error) {
    console.error("[email] send failed:", error);
    throw new EmailServiceError(
      error instanceof Error ? error.message : "Failed to send email",
      "SEND_FAILED",
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function appBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
