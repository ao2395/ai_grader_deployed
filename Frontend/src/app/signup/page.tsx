"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

const SignupClient = dynamic(() => import("./SignupClient"), { ssr: false });

export default function SignUp() {
  const handleGoogleSignUp = () => {
    window.location.href = "https://backend-839795182838.us-central1.run.app/api/v1/auth/google";
  };

  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500'></div>
          <p className='mt-4 text-xl font-semibold'>Loading...</p>
        </div>
      }
    >
      <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Create your account
          </h2>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <SignupClient />

            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                </div>
              </div>

              <div className='mt-6'>
                <button
                  onClick={handleGoogleSignUp}
                  className='w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                >
                  <FcGoogle className='w-5 h-5 mr-2' />
                  Sign up with Google
                </button>
              </div>
            </div>

            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Already have an account?</span>
                </div>
              </div>

              <div className='mt-6'>
                <Link
                  href='/login'
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50'
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
