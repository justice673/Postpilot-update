import { getAppBaseUrl } from "@/lib/services/x-oauth";

export type LinkedInOAuthErrorCode =
  | "oauth_start_failed"
  | "oauth_callback_invalid"
  | "oauth_state_mismatch"
  | "oauth_denied"
  | "oauth_callback_failed"
  | "missing_credentials";

export const LINKEDIN_SCOPES = "openid profile email w_member_social";

export function getLinkedInCallbackUrl(fallbackOrigin?: string): string {
  if (process.env.LINKEDIN_CALLBACK_URL) {
    return process.env.LINKEDIN_CALLBACK_URL;
  }
  return `${getAppBaseUrl(fallbackOrigin)}/api/auth/linkedin/callback`;
}

export function linkedInOAuthErrorMessage(code: LinkedInOAuthErrorCode): string {
  switch (code) {
    case "oauth_denied":
      return "LinkedIn authorization was cancelled.";
    case "oauth_callback_invalid":
      return "LinkedIn authorization was incomplete. Please try connecting again.";
    case "oauth_state_mismatch":
      return "LinkedIn authorization session expired. Please try connecting again.";
    case "oauth_callback_failed":
      return "LinkedIn could not complete authorization. Please try again.";
    case "missing_credentials":
      return "LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be configured.";
    default:
      return "Could not start LinkedIn authorization. Check your LinkedIn app credentials, then try again.";
  }
}
