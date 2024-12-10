import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "./Button"; // Assuming Button component exists in the project

export default function LearnerHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the auth token cookie
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Clear any data from localStorage
    localStorage.clear();

    // Redirect to the home page
    router.push("/");
  };

  return (
    <header className='bg-white shadow-md'>
      <div className='container mx-auto px-4 py-6 flex justify-between items-center'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-blue-500 rounded-full mr-3'></div>
          <span className='text-xl font-bold text-gray-800'>AI Grader</span>
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
              <Link href='/about' className='text-gray-600 hover:text-blue-500'>
                About
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
