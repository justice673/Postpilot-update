import "server-only";

import { TwitterApi } from "twitter-api-v2";

export function getXAppCredentials() {
  const appKey = process.env.X_API_KEY;
  const appSecret = process.env.X_API_SECRET;

  if (!appKey || !appSecret) {
    throw new Error("X_API_KEY and X_API_SECRET must be configured.");
  }

  return { appKey, appSecret };
}

export function createXAppClient() {
  const { appKey, appSecret } = getXAppCredentials();
  return new TwitterApi({ appKey, appSecret });
}

export function createXUserClient(accessToken: string, accessSecret: string) {
  const { appKey, appSecret } = getXAppCredentials();
  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });
}
