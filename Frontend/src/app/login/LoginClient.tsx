import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    // Check if we have a userId from Google OAuth callback
    const userId = searchParams.get("userId");
    if (userId) {
      // No need to set cookies manually, the server should have set the session
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
