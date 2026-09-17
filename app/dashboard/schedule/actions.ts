"use server";

import { revalidatePath } from "next/cache";
import {
  deletePost,
  getPosts,
  reschedulePost,
  updatePost,
  PostsServiceError,
} from "@/lib/services/posts";
import type { ScheduledPost, UpdatePostInput } from "@/lib/types/posts";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof PostsServiceError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

export async function getPostsAction(): Promise<ActionResult<ScheduledPost[]>> {
  try {
    const posts = await getPosts();
    return { success: true, data: posts };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deletePostAction(
  id: string,
): Promise<ActionResult> {
  try {
    await deletePost(id);
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updatePostAction(
  id: string,
  input: UpdatePostInput,
): Promise<ActionResult<ScheduledPost>> {
  try {
    const post = await updatePost(id, input);
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true, data: post };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reschedulePostAction(
  id: string,
  scheduledAt: string,
): Promise<ActionResult<ScheduledPost>> {
  try {
    const post = await reschedulePost(id, scheduledAt);
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true, data: post };
  } catch (error) {
    return toActionError(error);
  }
}
