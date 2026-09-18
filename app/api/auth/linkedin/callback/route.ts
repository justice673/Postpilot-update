import { NextRequest, NextResponse } from "next/server";
import {
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  personUrnFromSub,
} from "@/lib/services/linkedin";
import { connectLinkedInAccount } from "@/lib/services/settings";
import { getAppBaseUrl } from "@/lib/services/x-oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const base = getAppBaseUrl(request.nextUrl.origin);
  const origin = request.nextUrl.origin;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(new URL("/login", base));
    }

    const errorParam = request.nextUrl.searchParams.get("error");
    if (errorParam) {
      return NextResponse.redirect(
        new URL("/onboarding/connect?linkedin_error=oauth_denied", base),
      );
    }

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get("linkedin_oauth_state")?.value;

    if (!code || !state || !storedState) {
      return NextResponse.redirect(
        new URL(
          "/onboarding/connect?linkedin_error=oauth_callback_invalid",
          base,
        ),
      );
    }

    if (state !== storedState) {
      return NextResponse.redirect(
        new URL(
          "/onboarding/connect?linkedin_error=oauth_state_mismatch",
          base,
        ),
      );
    }

    const tokens = await exchangeLinkedInCode({
      code,
      fallbackOrigin: origin,
    });
    const profile = await fetchLinkedInUserInfo(tokens.accessToken);
    const expiresAt = new Date(
      Date.now() + tokens.expiresIn * 1000,
    ).toISOString();

    await connectLinkedInAccount({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
      expiresAt,
      personUrn: personUrnFromSub(profile.sub),
      username: profile.name || profile.email || profile.sub,
    });

    const response = NextResponse.redirect(
      new URL("/dashboard?linkedin_connected=true", base),
    );
    response.cookies.delete("linkedin_oauth_state");
    return response;
  } catch (error) {
    console.error("LinkedIn OAuth callback failed:", error);
    const response = NextResponse.redirect(
      new URL(
        "/onboarding/connect?linkedin_error=oauth_callback_failed",
        base,
      ),
    );
    response.cookies.delete("linkedin_oauth_state");
    return response;
  }
}
