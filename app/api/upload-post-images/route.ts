import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getStorageClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp)$/i.test(file.name);
}

function getContentType(file: File): string {
  if (file.type.startsWith("image/")) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };

  return map[ext ?? ""] ?? "application/octet-stream";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const storage = getStorageClient();
    const urls: string[] = [];

    for (const file of files) {
      if (!isImageFile(file)) continue;

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, error: `${file.name} is empty.` },
          { status: 400 },
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `${file.name} exceeds the 5 MB limit.` },
          { status: 400 },
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length === 0) {
        return NextResponse.json(
          { success: false, error: `Could not read ${file.name}.` },
          { status: 400 },
        );
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error: uploadError } = await storage.storage
        .from("post-images")
        .upload(path, bytes, {
          contentType: getContentType(file),
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          {
            success: false,
            error: uploadError.message || "Failed to upload image.",
          },
          { status: 400 },
        );
      }

      const { data } = storage.storage.from("post-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ success: true, data: urls });
  } catch (error) {
    console.error("upload-post-images:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
