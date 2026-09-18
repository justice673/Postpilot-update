import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildLinkedInAuthUrl } from "@/lib/services/linkedin";
import { getAppBaseUrl } from "@/lib/services/x-oauth";
import { createClient } from "@/lib/supabase/server";

const OAUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 600,
  path: "/",
};

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(new URL("/login", getAppBaseUrl(origin)));
    }

    const state = randomBytes(24).toString("hex");
    const authUrl = buildLinkedInAuthUrl({
      state,
      fallbackOrigin: origin,
    });

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("linkedin_oauth_state", state, OAUTH_COOKIE_OPTS);
    return response;
  } catch (error) {
    console.error("LinkedIn OAuth start failed:", error);
    const code =
      error instanceof Error &&
      error.message.includes("LINKEDIN_CLIENT_ID")
        ? "missing_credentials"
        : "oauth_start_failed";
    return NextResponse.redirect(
      new URL(`/onboarding/connect?linkedin_error=${code}`, getAppBaseUrl(origin)),
    );
  }
}
