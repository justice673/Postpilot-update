import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { connectXAccount } from "@/lib/services/settings";
import { getAppBaseUrl } from "@/lib/services/x-oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const base = getAppBaseUrl(request.nextUrl.origin);

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(new URL("/login", base));
    }

    const oauthToken = request.nextUrl.searchParams.get("oauth_token");
    const oauthVerifier = request.nextUrl.searchParams.get("oauth_verifier");
    const storedToken = request.cookies.get("x_oauth_token")?.value;
    const storedSecret = request.cookies.get("x_oauth_token_secret")?.value;

    if (!oauthToken || !oauthVerifier || !storedToken || !storedSecret) {
      return NextResponse.redirect(
        new URL("/onboarding/connect?x_error=oauth_callback_invalid", base),
      );
    }

    if (oauthToken !== storedToken) {
      return NextResponse.redirect(
        new URL("/onboarding/connect?x_error=oauth_token_mismatch", base),
      );
    }

    const { appKey, appSecret } = {
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
    };

    const requestClient = new TwitterApi({
      appKey,
      appSecret,
      accessToken: oauthToken,
      accessSecret: storedSecret,
    });

    const { accessToken, accessSecret, screenName } =
      await requestClient.login(oauthVerifier);

    await connectXAccount({
      accessToken,
      accessSecret,
      screenName,
    });

    const response = NextResponse.redirect(
      new URL("/dashboard?connected=true", base),
    );
    response.cookies.delete("x_oauth_token");
    response.cookies.delete("x_oauth_token_secret");

    return response;
  } catch (error) {
    console.error("X OAuth callback failed:", error);
    const response = NextResponse.redirect(
      new URL("/onboarding/connect?x_error=oauth_callback_failed", base),
    );
    response.cookies.delete("x_oauth_token");
    response.cookies.delete("x_oauth_token_secret");
    return response;
  }
}
