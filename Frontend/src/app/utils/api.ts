import { NextApiRequest } from "next";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  req?: NextApiRequest
) {
  let token;

  if (typeof window !== "undefined") {
    // Client-side
    token = localStorage.getItem("token");
  } else {
    // Server-side
    token = req?.cookies?.token;
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && typeof window !== "undefined") {
    // Only redirect on client-side
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}
