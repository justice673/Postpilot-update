import "server-only";

import {
  getLinkedInCallbackUrl,
  LINKEDIN_SCOPES,
} from "@/lib/services/linkedin-oauth";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";
const LINKEDIN_REGISTER_UPLOAD_URL =
  "https://api.linkedin.com/v2/assets?action=registerUpload";

export function getLinkedInAppCredentials() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be configured.",
    );
  }

  return { clientId, clientSecret };
}

export function buildLinkedInAuthUrl(input: {
  state: string;
  fallbackOrigin?: string;
}): string {
  const { clientId } = getLinkedInAppCredentials();
  const redirectUri = getLinkedInCallbackUrl(input.fallbackOrigin);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: input.state,
    scope: LINKEDIN_SCOPES,
  });
  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

export type LinkedInTokenResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  scope?: string;
};

export async function exchangeLinkedInCode(input: {
  code: string;
  fallbackOrigin?: string;
}): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret } = getLinkedInAppCredentials();
  const redirectUri = getLinkedInCallbackUrl(input.fallbackOrigin);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token || !data.expires_in) {
    throw new Error(
      data.error_description || data.error || "LinkedIn token exchange failed.",
    );
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
    refreshTokenExpiresIn: data.refresh_token_expires_in,
    scope: data.scope,
  };
}

export async function refreshLinkedInAccessToken(
  refreshToken: string,
): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret } = getLinkedInAppCredentials();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token || !data.expires_in) {
    throw new Error(
      data.error_description || data.error || "LinkedIn token refresh failed.",
    );
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token ?? refreshToken,
    refreshTokenExpiresIn: data.refresh_token_expires_in,
    scope: data.scope,
  };
}

export type LinkedInUserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

export async function fetchLinkedInUserInfo(
  accessToken: string,
): Promise<LinkedInUserInfo> {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await response.json()) as LinkedInUserInfo & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.sub) {
    throw new Error(
      data.error_description || data.error || "Failed to load LinkedIn profile.",
    );
  }

  return data;
}

function personUrnFromSub(sub: string): string {
  if (sub.startsWith("urn:li:person:")) return sub;
  return `urn:li:person:${sub}`;
}

async function linkedInApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      error?: string;
      error_description?: string;
    };
    return (
      data.message ||
      data.error_description ||
      data.error ||
      `LinkedIn API error (${response.status})`
    );
  } catch {
    return `LinkedIn API error (${response.status})`;
  }
}

function guessMimeType(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return map[ext ?? ""] ?? "image/jpeg";
}

async function registerAndUploadImage(
  accessToken: string,
  personUrn: string,
  imageUrl: string,
): Promise<string | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageUrl}`);
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const mimeType =
      imageResponse.headers.get("content-type") ?? guessMimeType(imageUrl);

    const registerResponse = await fetch(LINKEDIN_REGISTER_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    });

    if (!registerResponse.ok) {
      throw new Error(await linkedInApiError(registerResponse));
    }

    const registerData = (await registerResponse.json()) as {
      value?: {
        uploadMechanism?: {
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"?: {
            uploadUrl?: string;
            headers?: Record<string, string>;
          };
        };
        asset?: string;
      };
    };

    const uploadMeta =
      registerData.value?.uploadMechanism?.[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ];
    const uploadUrl = uploadMeta?.uploadUrl;
    const asset = registerData.value?.asset;

    if (!uploadUrl || !asset) {
      throw new Error("LinkedIn did not return an upload URL.");
    }

    const uploadHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": mimeType,
      ...(uploadMeta.headers ?? {}),
    };

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: uploadHeaders,
      body: buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `LinkedIn image upload failed (${uploadResponse.status})`,
      );
    }

    return asset;
  } catch (error) {
    console.warn("LinkedIn image upload failed, skipping:", imageUrl, error);
    return null;
  }
}

export async function createLinkedInPost(input: {
  accessToken: string;
  personUrn: string;
  content: string;
  imageUrls?: string[];
}): Promise<{ id: string }> {
  const personUrn = personUrnFromSub(input.personUrn);
  const imageUrls = input.imageUrls ?? [];

  let mediaAssets: string[] = [];
  if (imageUrls.length > 0) {
    const uploads = await Promise.all(
      imageUrls.slice(0, 9).map((url) =>
        registerAndUploadImage(input.accessToken, personUrn, url),
      ),
    );
    mediaAssets = uploads.filter((id): id is string => id !== null);
  }

  const shareContent =
    mediaAssets.length > 0
      ? {
          shareCommentary: { text: input.content },
          shareMediaCategory: "IMAGE",
          media: mediaAssets.map((asset) => ({
            status: "READY",
            media: asset,
          })),
        }
      : {
          shareCommentary: { text: input.content },
          shareMediaCategory: "NONE",
        };

  const response = await fetch(LINKEDIN_UGC_POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": shareContent,
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await linkedInApiError(response));
  }

  const postId =
    response.headers.get("x-restli-id") ||
    response.headers.get("x-linkedin-id") ||
    "";

  if (postId) {
    return { id: postId };
  }

  try {
    const data = (await response.json()) as { id?: string };
    if (data.id) return { id: data.id };
  } catch {
    // LinkedIn often returns an empty body with the id only in headers.
  }

  return { id: "unknown" };
}

export { personUrnFromSub };
