"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  deleteAccount,
  ProfileServiceError,
  updatePassword,
  updateProfile,
} from "@/lib/services/profile";
import type { UpdateProfileInput, UserProfile } from "@/lib/types/profile";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof ProfileServiceError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

export async function saveProfileAction(
  input: UpdateProfileInput,
): Promise<ActionResult<UserProfile>> {
  try {
    const profile = await updateProfile(input);
    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard", "layout");
    return { success: true, data: profile };
  } catch (error) {
    return toActionError(error);
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<void>> {
  try {
    await updatePassword(input.currentPassword, input.newPassword);
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAccountAction(input: {
  currentPassword: string;
  confirmation: string;
}): Promise<ActionResult<void>> {
  if (input.confirmation.trim().toUpperCase() !== "DELETE") {
    return {
      success: false,
      error:
        "Type DELETE to confirm you want to permanently remove this account.",
    };
  }

  try {
    await deleteAccount(input.currentPassword);
  } catch (error) {
    return toActionError(error);
  }

  redirect("/login");
}
