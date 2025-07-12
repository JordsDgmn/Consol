'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUser(); // ✅ Access and modify user

  const handleExit = () => {
    setUser(null);               // Clear user context
    router.push('/');            // Redirect to welcome screen
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white">
      {/* Logo */}
      <div className="text-2xl font-bold bg-gray-200 px-4 py-1 rounded-xl text-black">
        Consol
      </div>

      {/* Buttons only show when user is selected */}
      {user && (
        <div className="space-x-2 flex items-center">
          <Link href="/dashboard">
            <button
              className={`px-4 py-1 border rounded transition ${
                pathname === '/dashboard'
                  ? 'bg-white text-black border-gray-300  hover:bg-gray-300 '
                  : 'border-white text-black hover:bg-purple-100 '
              }`}
            >
              Dashboard
            </button>
          </Link>

          <Link href="/profile">
            <button
              className={`px-4 py-1 border rounded transition ${
                pathname === '/profile'
                  ? 'bg-white border-gray-300  text-black '
                  : 'border-white text-black hover:bg-purple-100 '
              }`}
            >
              Profile
            </button>
          </Link>

          {/* Exit Button */}
          <button
            onClick={handleExit}
            className="px-4 py-1 rounded  text-red-700 hover:bg-red-100 "
          >
            Exit
          </button>
        </div>

      )}
    </header>
  );
}
