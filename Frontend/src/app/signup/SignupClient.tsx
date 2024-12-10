import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize searchParams inside the effect to avoid dependency issues
      const searchParams = new URLSearchParams(window.location.search);

      // Check if we have a token from Google OAuth callback
      const token = searchParams.get("token");
      if (token) {
        localStorage.setItem("token", token);
        router.push("/learner-home");
      }
    }
  }, [router]);

  const handleGoogleSignup = async () => {
    try {
      if (typeof window !== "undefined") {
        window.location.href =
          "https://backend-839795182838.us-central1.run.app/api/v1/auth/google";
      }
    } catch (error) {
      console.error("Error during Google signup:", error);
    }
  };

  return { handleGoogleSignup };
};

export default useGoogleOAuth;
