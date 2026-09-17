"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  AdminServiceError,
  deleteAdminUser,
  setAdminUserSuspended,
  updateAdminUserRole,
} from "@/lib/services/admin";
import type { UserRole } from "@/lib/types/profile";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult {
  if (error instanceof AdminServiceError) {
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

export async function setUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === userId && role !== "super_admin") {
      return {
        success: false,
        error: "You can’t remove your own admin role.",
      };
    }
    await updateAdminUserRole(userId, role);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return toActionError(error);
  }
}

export async function setUserSuspendedAction(
  userId: string,
  suspended: boolean,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === userId) {
      return { success: false, error: "You can’t suspend your own account." };
    }
    await setAdminUserSuspended(userId, suspended);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return toActionError(error);
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === userId) {
      return { success: false, error: "You can’t delete your own account." };
    }
    await deleteAdminUser(userId);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return toActionError(error);
  }
}
