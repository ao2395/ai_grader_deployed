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

  const headers = new Headers(options.headers);

  // Only set Content-Type to application/json if it's not a FormData object
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        // Client-side: Handle unauthorized response
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      throw new Error(`HTTP error! status, api: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
