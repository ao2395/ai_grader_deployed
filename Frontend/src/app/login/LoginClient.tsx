import { useRouter } from "next/router";
import { useEffect } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    // Check if we have a token from Google OAuth callback
    const token = searchParams.get("token");
    if (token) {
      document.cookie = `authToken=${token}; path=/; secure; HttpOnly; SameSite=Strict`;
      router.push("/practice");
    }
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      window.location.href =
        "https://backend-839795182838.us-central1.run.app/api/v1/auth/google?redirect_url=https://frontend-839795182838.us-central1.run.app/auth/callback";
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return { handleGoogleLogin };
};

export default useGoogleOAuth;
