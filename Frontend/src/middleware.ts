import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which paths are considered public (don't require authentication)
  const isPublicPath = path === "/login" || path === "/signup" || path === "/";

  // Check for session cookie
  const sessionId = request.cookies.get("connect.sid")?.value;

  // If the path is not public and there's no token, redirect to signup
  if (!isPublicPath && !sessionId) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // If the user is logged in and tries to access login or signup, redirect to learner-home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/learner-home", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Add any other routes that should be protected
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/learner-home",
    "/practice",
    "/dashboard",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
