// LoginClient.tsx

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user: {
    id: string;
    // Add other user properties if needed
  };
  // Add other token properties if needed
}

const useGoogleOAuth = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");

      if (token) {
        try {
          // Decode the token to extract user information
          const decoded: DecodedToken = jwtDecode(token);

          // Ensure that the token contains the necessary user information
          if (decoded && decoded.user && decoded.user.id) {
            // Set the token and userId in cookies with a 7-day expiration
            Cookies.set("token", token, { expires: 7, secure: true, sameSite: "lax" });
            Cookies.set("userId", decoded.user.id, { expires: 7, secure: true, sameSite: "lax" });

            // Redirect to the learner home page
            router.push("/learner-home");
          } else {
            console.error("Invalid token structure.");
            // Optionally, redirect to the login page or show an error
            router.push("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          // Optionally, redirect to the login page or show an error
          router.push("/login");
        }
      }
    }
  }, [router]);

  const handleGoogleLogin = async () => {
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
  };

  return { handleGoogleLogin };
};

export default useGoogleOAuth;
