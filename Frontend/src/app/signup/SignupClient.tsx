// LoginClient.tsx

import { useCallback } from "react";

const useGoogleOAuth = () => {

  const handleGoogleSignup = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        // Initiate the Google OAuth flow
        window.location.href =
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google`;
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      // Optionally, handle the error by showing a notification to the user
    }
  }, []);

  return { handleGoogleSignup };
};

export default useGoogleOAuth;
