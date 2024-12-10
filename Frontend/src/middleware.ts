import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which paths are considered public (don't require authentication)
  const isPublicPath = path === "/login" || path === "/signup" || path === "/";

  // Check for JWT token in cookies
  const token = request.cookies.get("token")?.value;

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // If the user has a token and tries to access login or signup, redirect to learner-home
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
    "/feedback",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
