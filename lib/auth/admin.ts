import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/profile";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function getSuperAdminEmails(): Set<string> {
  const raw = process.env.SUPER_ADMIN_EMAIL ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isEmailSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return getSuperAdminEmails().has(email.trim().toLowerCase());
}

async function getProfileRole(userId: string): Promise<UserRole> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) return "user";
  return data.role as UserRole;
}

async function promoteToSuperAdmin(userId: string): Promise<void> {
  const supabase = getServiceClient();
  await supabase
    .from("profiles")
    .update({ role: "super_admin" })
    .eq("user_id", userId);
}

async function userIsSuperAdmin(user: User): Promise<boolean> {
  if (isEmailSuperAdmin(user.email)) {
    const role = await getProfileRole(user.id);
    if (role !== "super_admin") {
      await promoteToSuperAdmin(user.id);
    }
    return true;
  }

  return (await getProfileRole(user.id)) === "super_admin";
}

/** Returns whether the signed-in user is a super admin (no redirect). */
export async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  return userIsSuperAdmin(user);
}

/** Require super admin; redirects to login or dashboard otherwise. */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (!(await userIsSuperAdmin(user))) {
    redirect("/dashboard");
  }

  return user;
}
