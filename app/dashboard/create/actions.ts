"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { expandPrompt, generateImage, GeminiServiceError } from "@/lib/services/gemini";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { createPost, PostsServiceError } from "@/lib/services/posts";
import { getSettings, SettingsServiceError } from "@/lib/services/settings";
import type { CreatePostInput, ScheduledPost } from "@/lib/types/posts";
import { revalidatePath } from "next/cache";

function getStorageClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof PostsServiceError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}

function getImageExtension(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  return mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png";
}

async function uploadImageBuffer(
  userId: string,
  bytes: Buffer,
  mimeType: string,
): Promise<string> {
  if (bytes.length > 5 * 1024 * 1024) {
    throw new GeminiServiceError("Generated image exceeds the 5 MB limit.");
  }

  const storage = getStorageClient();
  const ext = getImageExtension(mimeType);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error: uploadError } = await storage.storage
    .from("post-images")
    .upload(path, bytes, { contentType: mimeType, upsert: false });

  if (uploadError) {
    throw new GeminiServiceError(
      uploadError.message || "Failed to upload generated image.",
    );
  }

  const { data } = storage.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function expandPromptAction(
  prompt: string,
): Promise<ActionResult<string>> {
  try {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return { success: false, error: "Prompt is required." };
    }

    const [platform, settings] = await Promise.all([
      getPlatformSettings(),
      getSettings(),
    ]);
    if (!platform.aiWritingEnabled) {
      return {
        success: false,
        error: "AI writing is currently disabled by the platform admin.",
      };
    }
    if (!settings.aiWritingEnabled) {
      return { success: false, error: "AI writing is disabled in settings." };
    }

    const content = await expandPrompt(trimmed, {
      apiKey: settings.geminiApiKey || null,
    });

    return { success: true, data: content };
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return { success: false, error: error.message };
    }
    if (error instanceof SettingsServiceError) {
      return { success: false, error: error.message };
    }
    console.error("expandPromptAction failed:", error);
    return toActionError(error);
  }
}

export async function generateImageAction(
  prompt: string,
): Promise<ActionResult<string>> {
  if (process.env.ENABLE_GEMINI_IMAGE_GEN !== "true") {
    return {
      success: false,
      error:
        "AI image generation is coming soon. Please upload an image from your device for now.",
    };
  }

  try {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return { success: false, error: "Image prompt is required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const [platform, settings] = await Promise.all([
      getPlatformSettings(),
      getSettings(),
    ]);
    if (!platform.aiWritingEnabled) {
      return {
        success: false,
        error: "AI features are currently disabled by the platform admin.",
      };
    }
    if (!settings.aiWritingEnabled) {
      return { success: false, error: "AI features are disabled in settings." };
    }

    const image = await generateImage(trimmed, {
      apiKey: settings.geminiApiKey || null,
    });

    const bytes = Buffer.from(image.data, "base64");
    const publicUrl = await uploadImageBuffer(user.id, bytes, image.mimeType);

    return { success: true, data: publicUrl };
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return { success: false, error: error.message };
    }
    if (error instanceof SettingsServiceError) {
      return { success: false, error: error.message };
    }
    console.error("generateImageAction failed:", error);
    return toActionError(error);
  }
}

export async function createPostAction(
  input: CreatePostInput,
): Promise<ActionResult<ScheduledPost>> {
  try {
    if (!input.content.trim()) {
      return { success: false, error: "Post content is required." };
    }

    const settings = await getSettings();
    if (!settings.xConnected) {
      return {
        success: false,
        error: "Connect your X account in Settings before scheduling posts.",
      };
    }

    const post = await createPost(input);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/analytics");

    return { success: true, data: post };
  } catch (error) {
    return toActionError(error);
  }
}

export async function uploadPostImagesAction(
  formData: FormData,
): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated." };
    }

    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return { success: true, data: [] };
    }

    const urls: string[] = [];
    const storage = getStorageClient();

    for (const file of files) {
      if (!file.type.startsWith("image/") && !/\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: `${file.name} exceeds the 5 MB limit.` };
      }
      if (file.size === 0) {
        return { success: false, error: `${file.name} is empty.` };
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const contentType =
        file.type.startsWith("image/") ? file.type : `image/${ext === "jpg" ? "jpeg" : ext}`;

      const { error: uploadError } = await storage.storage
        .from("post-images")
        .upload(path, bytes, { contentType, upsert: false });

      if (uploadError) {
        return {
          success: false,
          error: uploadError.message || "Failed to upload image.",
        };
      }

      const { data } = storage.storage.from("post-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return { success: true, data: urls };
  } catch (error) {
    return toActionError(error);
  }
}
