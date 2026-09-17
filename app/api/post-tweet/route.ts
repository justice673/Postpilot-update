import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TwitterApi } from "twitter-api-v2";
import {
  notifyPostFailed,
  notifyPostPublished,
} from "@/lib/services/notification-mail";
import { getXTokensForUser } from "@/lib/services/settings";
import { createXUserClient } from "@/lib/services/x-twitter";
import type { PostRow } from "@/lib/types/posts";

function formatTweetError(err: unknown): { message: string; code?: number } {
  if (err && typeof err === "object") {
    const apiErr = err as {
      code?: number;
      message?: string;
      data?: { detail?: string; title?: string };
    };

    if (apiErr.code === 402) {
      return {
        code: 402,
        message:
          "X API requires paid credits to post tweets. Add credits at developer.x.com → Billing, then retry.",
      };
    }

    if (apiErr.data?.detail) {
      return { code: apiErr.code, message: apiErr.data.detail };
    }

    if (apiErr.message) {
      return { code: apiErr.code, message: apiErr.message };
    }
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: "Unknown error" };
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
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

async function uploadImageToX(
  client: TwitterApi,
  imageUrl: string,
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${imageUrl}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType =
      response.headers.get("content-type") ?? guessMimeType(imageUrl);

    return await client.v1.uploadMedia(buffer, { mimeType: contentType });
  } catch (err) {
    console.warn("Image upload failed, skipping:", imageUrl, err);
    return null;
  }
}

async function uploadImages(
  client: TwitterApi,
  imageUrls: string[],
): Promise<string[]> {
  const uploads = await Promise.all(
    imageUrls.slice(0, 4).map((url) => uploadImageToX(client, url)),
  );
  return uploads.filter((id): id is string => id !== null);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  let post: PostRow | null = null;

  try {
    const cronSecret = process.env.N8N_CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.headers.get("x-n8n-secret");

      if (token !== cronSecret) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "No pending posts",
      });
    }

    post = data as PostRow;

    const xTokens = await getXTokensForUser(post.user_id);
    if (!xTokens) {
      await supabase
        .from("posts")
        .update({
          status: "failed",
          posted_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      void notifyPostFailed({
        userId: post.user_id,
        content: post.content,
        reason: "X account not connected.",
      });

      return NextResponse.json(
        {
          success: false,
          error: "X account not connected for this user.",
          post_id: post.id,
        },
        { status: 400 },
      );
    }

    const twitterClient = createXUserClient(
      xTokens.accessToken,
      xTokens.accessSecret,
    );
    const imageUrls = post.image_urls ?? [];

    let mediaIds: string[] = [];
    if (post.has_image && imageUrls.length > 0) {
      mediaIds = await uploadImages(twitterClient, imageUrls);
    }

    const tweet =
      mediaIds.length > 0
        ? await twitterClient.v2.tweet(post.content, {
            media: {
              media_ids: mediaIds as
                | [string]
                | [string, string]
                | [string, string, string]
                | [string, string, string, string],
            },
          })
        : await twitterClient.v2.tweet(post.content);

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        status: "posted",
        posted_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (updateError) {
      throw updateError;
    }

    void notifyPostPublished({
      userId: post.user_id,
      content: post.content,
      tweetId: tweet.data.id,
      xUsername: xTokens.username,
    });

    return NextResponse.json({
      success: true,
      tweet_id: tweet.data.id,
      content: post.content,
      images_uploaded: mediaIds.length,
      x_username: xTokens.username,
    });
  } catch (err: unknown) {
    console.error("Tweet error:", err);

    const { message, code } = formatTweetError(err);
    const isBillingError = code === 402;

    if (post?.id && !isBillingError) {
      await supabase
        .from("posts")
        .update({
          status: "failed",
          posted_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      void notifyPostFailed({
        userId: post.user_id,
        content: post.content,
        reason: message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        code,
        post_id: post?.id,
        retryable: isBillingError,
      },
      { status: isBillingError ? 402 : 500 },
    );
  }
}
