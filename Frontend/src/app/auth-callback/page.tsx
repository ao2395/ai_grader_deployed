// pages/auth-callback.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user: {
    id: string;
  };
}

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");

      if (token) {
        try {
          // Decode the token to extract user information
          const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
          //console.log(decoded)

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
            router.push("/signup");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          // Optionally, redirect to the login page or show an error
          router.push("/signup");
        }
      } else {
        // No token found, redirect to login
        router.push("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
