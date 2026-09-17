"use server";

import { getPlatformSettings } from "@/lib/services/platform-settings";

export async function assertSignupsOpenAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const settings = await getPlatformSettings();
    if (!settings.signupsOpen) {
      return {
        success: false,
        error: "New signups are currently closed. Please check back later.",
      };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Couldn’t verify signup availability." };
  }
}
