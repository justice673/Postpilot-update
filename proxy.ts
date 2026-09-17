import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { getPlatformSettingsCached } from "@/lib/services/platform-settings";

const protectedPrefixes = ["/dashboard", "/admin", "/onboarding"];

const maintenanceBypassPrefixes = [
  "/admin",
  "/login",
  "/maintenance",
  "/api",
  "/_next",
];

function isEmailSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const raw = process.env.SUPER_ADMIN_EMAIL ?? "";
  const allowed = new Set(
    raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  return allowed.has(email.trim().toLowerCase());
}

async function userIsSuperAdmin(
  userId: string,
  email: string | undefined,
): Promise<boolean> {
  if (isEmailSuperAdmin(email)) return true;

  try {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.role === "super_admin";
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) =>
    path.startsWith(prefix),
  );

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const settings = await getPlatformSettingsCached();

  if (settings.maintenanceMode) {
    const bypass = maintenanceBypassPrefixes.some((prefix) =>
      path.startsWith(prefix),
    );
    const isSuperAdmin = user
      ? await userIsSuperAdmin(user.id, user.email)
      : false;

    if (!bypass && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  }

  if (!settings.signupsOpen && path === "/register" && !user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("signups", "closed");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/maintenance",
  ],
};
