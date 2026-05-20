import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const REDIRECT_PATHS = ["/generate", "/history"];
const AUTH_PATHS = [
  "/generate", "/history",
  "/api/generate", "/api/history", "/api/credits",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const needsRedirect = REDIRECT_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (needsRedirect) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // API 路径不重定向，让 API 自己返回 401
    return response;
  }

  response.headers.set("x-user-id", user.id);
  return response;
}

export const config = {
  matcher: [
    "/generate", "/history",
    "/api/generate", "/api/history", "/api/credits",
  ],
};
