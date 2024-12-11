// LoginClient.tsx

import { useRouter } from "next/navigation";
import { useCallback } from "react";

const useGoogleOAuth = () => {
  const router = useRouter();

  const handleGoogleSignup = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        // Initiate the Google OAuth flow
        window.location.href =
          "https://backend-839795182838.us-central1.run.app/api/v1/auth/google";
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      // Optionally, handle the error by showing a notification to the user
    }
  }, [router]);

  return { handleGoogleSignup };
};

export default useGoogleOAuth;
