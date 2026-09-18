import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  disconnectLinkedInAccount,
  SettingsServiceError,
} from "@/lib/services/settings";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
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

    await disconnectLinkedInAccount();
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/create");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("LinkedIn disconnect failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
