import { NextRequest, NextResponse } from "next/server";
import { sendDailyReminders } from "@/lib/services/notification-mail";

function authorize(req: NextRequest): boolean {
  const cronSecret = process.env.N8N_CRON_SECRET || process.env.CRON_SECRET;
  if (!cronSecret) {
    // Allow in local dev without a secret; require in production-like envs.
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers.get("x-n8n-secret") || req.headers.get("x-cron-secret");

  return token === cronSecret;
}

/** Cron: daily schedule reminder emails. */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result = await sendDailyReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("daily-reminder cron:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cron failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
