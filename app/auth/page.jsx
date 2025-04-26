"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";

const LoginPage = () => {
  const LoginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error("Login Error:", error.message);
        alert("Failed to login with Google: " + error.message);
      } else {
        console.log("Login initiated successfully");
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      alert("An unexpected error occurred during login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 py-8">
      <div className="card-border w-full max-w-md mx-auto">
        <div className="flex flex-col gap-6 card py-10 px-6 sm:py-14 sm:px-10">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.jpg" alt="logo" height={32} width={38} />
            <h2 className="text-primary-100">PrepWise</h2>
          </div>

          {/* Heading */}
          <h3 className="text-center text-xl sm:text-2xl">
            Practice job interviews with AI
          </h3>

          {/* Login Image */}
          <div className="w-full mt-2 mb-4 sm:mt-4 sm:mb-6 flex justify-center">
            <Image
              src="/login.jpeg"
              alt="Login illustration"
              width={400}
              height={250}
              className="rounded-lg w-full h-auto object-cover"
            />
          </div>

          {/* Google Login Button */}
          <Button
            className="btn-primary flex items-center justify-center gap-3 w-full py-4 sm:py-6 text-sm sm:text-base"
            type="button"
            onClick={LoginWithGoogle}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-5 sm:h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.1 0 5.8 1.2 7.9 3.2l5.9-5.9C33.5 2.8 29.1 1 24 1 14.6 1 6.7 6.7 3.2 14.3l6.9 5.4C11.6 14 17.3 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24.5c0-1.7-.2-3.3-.5-4.8H24v9.1h12.7c-.5 2.6-2.1 4.9-4.5 6.4l7 5.4c4.1-3.8 6.3-9.4 6.3-15.9z"
              />
              <path
                fill="#FBBC05"
                d="M10.1 28.6c-1-3-1-6.3 0-9.3l-6.9-5.3c-2.9 5.7-2.9 12.6 0 18.3l6.9-5.3z"
              />
              <path
                fill="#4285F4"
                d="M24 46c5.1 0 9.5-1.7 12.7-4.7l-7-5.4c-2 1.4-4.5 2.2-7.1 2.2-6.7 0-12.4-4.5-14.4-10.6l-6.9 5.3C6.7 41.3 14.6 47 24 47z"
              />
            </svg>

            <span>Continue with Google</span>
          </Button>

          <p className="text-center text-light-400 mt-2 sm:mt-4 text-sm sm:text-base">
            {"No account yet? "}
            <Link href="/sign-up" className="font-bold text-primary-200">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
