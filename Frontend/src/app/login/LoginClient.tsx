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
      router.push("/learner-home");
    }
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(
        "https://backend-839795182838.us-central1.run.app//api/v1/auth/google"
      );
      const data = await response.json();
      // Set a secure, HTTP-only cookie instead of using localStorage
      document.cookie = `authToken=${data.token}; path=/; secure; HttpOnly; SameSite=Strict`;

      router.push("/learner-home");
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return { handleGoogleLogin };
};

export default useGoogleOAuth;
