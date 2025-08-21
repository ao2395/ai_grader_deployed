"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function LearnerHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove all user-related cookies
    Cookies.remove("token");
    Cookies.remove("userId");
  
    // Redirect to the home page
    router.push("/");
  };

  return (
    <header className='bg-white shadow-md'>
      <div className='container mx-auto px-4 py-6 flex justify-between items-center'>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DrawExplain</h1>
              <p className="text-xs text-gray-600">Draw it, explain it, master it!</p>
            </div>
          </div>
        </div>
        <nav>
          <ul className='flex space-x-6 items-center'>
            <li>
              <Link href='/learner-home' className='text-gray-600 hover:text-blue-500'>
                Home
              </Link>
            </li>
            <li>
              <Link href='/practice' className='text-gray-600 hover:text-blue-500'>
                Practice
              </Link>
            </li>
            <li>
              <Button
                variant='outline'
                className='text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
