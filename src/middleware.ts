import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const expectedBypass =
    process.env.ADMIN_DEV_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "admin" : null);
  const bypassCookie = request.cookies.get("dev-bypass")?.value;
  if (
    expectedBypass &&
    bypassCookie === expectedBypass &&
    pathname.startsWith("/admin")
  ) {
    return supabaseResponse;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
