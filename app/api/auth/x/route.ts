import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createXAppClient,
} from "@/lib/services/x-twitter";
import {
  getAppBaseUrl,
  getXCallbackUrl,
  parseXOAuthError,
} from "@/lib/services/x-oauth";

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

    const client = createXAppClient();
    const callbackUrl = getXCallbackUrl(origin);
    const authLink = await client.generateAuthLink(callbackUrl);

    const response = NextResponse.redirect(authLink.url);
    response.cookies.set("x_oauth_token", authLink.oauth_token, OAUTH_COOKIE_OPTS);
    response.cookies.set(
      "x_oauth_token_secret",
      authLink.oauth_token_secret,
      OAUTH_COOKIE_OPTS,
    );

    return response;
  } catch (error) {
    console.error("X OAuth start failed:", error);
    const code = parseXOAuthError(error);
    return NextResponse.redirect(
      new URL(`/onboarding/connect?x_error=${code}`, getAppBaseUrl(origin)),
    );
  }
}
