// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which paths are considered public (don't require authentication)
  const isPublicPath =
    path === "/login" || path === "/signup" || path === "/" || path === "/auth-callback"; // Added /auth-callback

  // Check for JWT token in cookies
  const token = request.cookies.get("token")?.value;

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/signup", request.url)); // Redirect to /login
  }

  // If the user has a token and tries to access login, signup, or auth-callback, redirect to learner-home
  if (isPublicPath && token) {
    // Exclude /auth-callback from redirection to prevent infinite loops
    if (path !== "/auth-callback") {
      return NextResponse.redirect(new URL("/learner-home", request.url));
    }
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
    "/auth-callback", // Added /auth-callback to ensure it's public
    "/learner-home",
    "/practice",
    "/dashboard",
    "/feedback",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
