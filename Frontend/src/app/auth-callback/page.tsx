"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      router.push("/learner-home");
    } else {
      router.push("/signup");
    }
  }, [router, searchParams]);

  return <div>Authenticating...</div>;
}
