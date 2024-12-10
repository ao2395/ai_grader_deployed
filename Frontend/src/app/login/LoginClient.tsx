import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create searchParams inside useEffect to avoid dependency issues
      const searchParams = new URLSearchParams(window.location.search);

      // Check if we have a token from Google OAuth callback
      const token = searchParams.get("token");
      if (token) {
        localStorage.setItem("token", token);
        router.push("/learner-home");
      }
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      if (typeof window !== "undefined") {
        window.location.href =
          "https://backend-839795182838.us-central1.run.app/api/v1/auth/google";
      }
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return { handleGoogleLogin };
};

export default useGoogleOAuth;
