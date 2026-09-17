"use server";

import { revalidatePath } from "next/cache";
import {
  SettingsServiceError,
  updateSettings,
} from "@/lib/services/settings";
import type { UpdateSettingsInput, UserSettings } from "@/lib/types/settings";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof SettingsServiceError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

export async function saveSettingsAction(
  input: UpdateSettingsInput,
): Promise<ActionResult<UserSettings>> {
  try {
    const settings = await updateSettings(input);
    revalidatePath("/dashboard/settings");
    return { success: true, data: settings };
  } catch (error) {
    return toActionError(error);
  }
}
