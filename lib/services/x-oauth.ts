export type XOAuthErrorCode =
  | "callback_not_approved"
  | "oauth_start_failed"
  | "oauth_callback_invalid"
  | "oauth_token_mismatch"
  | "oauth_callback_failed";

/** Public app URL — prefers env, then request origin, then Vercel, then localhost. */
export function getAppBaseUrl(fallbackOrigin?: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getXCallbackUrl(fallbackOrigin?: string): string {
  if (process.env.X_CALLBACK_URL) {
    return process.env.X_CALLBACK_URL;
  }
  return `${getAppBaseUrl(fallbackOrigin)}/api/auth/x/callback`;
}

export function parseXOAuthError(error: unknown): XOAuthErrorCode {
  const parts: string[] = [];
  if (error instanceof Error) parts.push(error.message);
  if (error && typeof error === "object" && "data" in error) {
    parts.push(JSON.stringify((error as { data?: unknown }).data));
  }
  const message = parts.join(" ");

  if (message.includes("Callback URL not approved") || message.includes('"415"')) {
    return "callback_not_approved";
  }

  return "oauth_start_failed";
}

export function xOAuthErrorMessage(
  code: XOAuthErrorCode,
  callbackUrl?: string,
): string {
  switch (code) {
    case "callback_not_approved":
      return `Add this callback URL in the X Developer Portal under User authentication settings: ${callbackUrl ?? getXCallbackUrl()}`;
    case "oauth_callback_invalid":
      return "X authorization was incomplete. Please try connecting again.";
    case "oauth_token_mismatch":
      return "X authorization session expired. Please try connecting again.";
    case "oauth_callback_failed":
      return "X could not complete authorization. Please try again.";
    default:
      return "Could not start X authorization. Check X_API_KEY and X_API_SECRET, then try again.";
  }
}
