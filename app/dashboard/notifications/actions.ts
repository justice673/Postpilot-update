"use server";

import { revalidatePath } from "next/cache";
import {
  NotificationsServiceError,
  updateNotificationSettings,
} from "@/lib/services/notifications";
import type {
  NotificationSettings,
  UpdateNotificationSettingsInput,
} from "@/lib/types/notifications";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof NotificationsServiceError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

export async function saveNotificationSettingsAction(
  input: UpdateNotificationSettingsInput,
): Promise<ActionResult<NotificationSettings>> {
  try {
    const settings = await updateNotificationSettings(input);
    revalidatePath("/dashboard/notifications");
    return { success: true, data: settings };
  } catch (error) {
    return toActionError(error);
  }
}
