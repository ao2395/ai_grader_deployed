import type { NextRequest } from "next/server";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  req?: NextRequest
) {
  let token: string | undefined;

  // Check if we're on the client-side
  if (typeof window !== "undefined") {
    token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  } else if (req?.cookies?.get) {
    // Server-side: Get token from the request cookies safely
    const cookie = req.cookies.get("token");
    token = typeof cookie === "string" ? cookie : cookie?.value;
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && typeof window !== "undefined") {
      // Client-side: Handle unauthorized response
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
