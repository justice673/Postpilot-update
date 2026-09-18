import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createLinkedInPost,
  refreshLinkedInAccessToken,
} from "@/lib/services/linkedin";
import {
  notifyPostFailed,
  notifyPostPublished,
} from "@/lib/services/notification-mail";
import {
  getLinkedInTokensForUser,
  updateLinkedInTokensForUser,
} from "@/lib/services/settings";
import type { PostRow } from "@/lib/types/posts";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function resolveLinkedInAccessToken(userId: string) {
  const tokens = await getLinkedInTokensForUser(userId);
  if (!tokens) return null;

  const expiresAtMs = tokens.expiresAt
    ? new Date(tokens.expiresAt).getTime()
    : null;
  const needsRefresh =
    Boolean(tokens.refreshToken) &&
    (expiresAtMs === null || expiresAtMs - Date.now() < 5 * 60 * 1000);

  if (!needsRefresh || !tokens.refreshToken) {
    return tokens;
  }

  const refreshed = await refreshLinkedInAccessToken(tokens.refreshToken);
  const expiresAt = new Date(
    Date.now() + refreshed.expiresIn * 1000,
  ).toISOString();

  await updateLinkedInTokensForUser(userId, {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    expiresAt,
  });

  return {
    ...tokens,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    expiresAt,
  };
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
      .eq("platform", "linkedin")
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
        message: "No pending LinkedIn posts",
      });
    }

    post = data as PostRow;

    const linkedInTokens = await resolveLinkedInAccessToken(post.user_id);
    if (!linkedInTokens) {
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
        reason: "LinkedIn account not connected.",
      });

      return NextResponse.json(
        {
          success: false,
          error: "LinkedIn account not connected for this user.",
          post_id: post.id,
        },
        { status: 400 },
      );
    }

    const imageUrls = post.image_urls ?? [];
    const result = await createLinkedInPost({
      accessToken: linkedInTokens.accessToken,
      personUrn: linkedInTokens.personUrn,
      content: post.content,
      imageUrls: post.has_image ? imageUrls : [],
    });

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
      linkedInPostId: result.id,
      linkedInUsername: linkedInTokens.username,
    });

    return NextResponse.json({
      success: true,
      linkedin_post_id: result.id,
      content: post.content,
      images_uploaded: Math.min(imageUrls.length, 9),
      linkedin_username: linkedInTokens.username,
    });
  } catch (err: unknown) {
    console.error("LinkedIn post error:", err);

    const message =
      err instanceof Error ? err.message : "Unknown LinkedIn publish error";

    if (post?.id) {
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
        post_id: post?.id,
      },
      { status: 500 },
    );
  }
}
