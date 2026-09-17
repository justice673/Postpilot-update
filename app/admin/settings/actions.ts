"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  PlatformSettingsError,
  updatePlatformSettings,
} from "@/lib/services/platform-settings";
import type { PlatformSettingsUpdate } from "@/lib/types/platform-settings";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult {
  if (error instanceof PlatformSettingsError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

function rethrowRedirect(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

export async function savePlatformSettingsAction(
  input: PlatformSettingsUpdate,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await updatePlatformSettings(input);
    revalidatePath("/admin/settings");
    revalidatePath("/register");
    revalidatePath("/maintenance");
    revalidatePath("/dashboard/create");
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return toActionError(error);
  }
}
