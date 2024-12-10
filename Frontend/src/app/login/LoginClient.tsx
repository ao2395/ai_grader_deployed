import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    // Check if we have a token from Google OAuth callback
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      router.push("/learner-home");
    }
  }, [router, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      window.location.href = "https://backend-839795182838.us-central1.run.app/api/v1/auth/google";
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  return { handleGoogleLogin };
};

export default useGoogleOAuth;
