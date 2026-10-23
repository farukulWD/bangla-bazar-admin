import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/next-path";
import { AUTH_COOKIE_NAME } from "@/store/api/token";

export const proxy = (request: NextRequest) => {
  if (request.cookies.has(AUTH_COOKIE_NAME)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = request.nextUrl.clone();

  login.pathname = "/login";
  login.search = "";

  const next = safeNextPath(`${pathname}${search}`);
  if (next && pathname !== "/") login.searchParams.set("next", next);

  return NextResponse.redirect(login);
};

export const config = {
  matcher: [
    "/((?!login|forgot-password|verify-otp|reset-password|api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
