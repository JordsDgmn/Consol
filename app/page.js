'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useUser } from '@/lib/UserContext';

export default function LandingPage() {
  const { setUser } = useUser();

  useEffect(() => {
    // ✅ Clear user context when landing page is mounted
    setUser(null);
  }, [setUser]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold mb-6">Welcome to Consol</h1>
      <p className="mb-8 text-gray-600">Select or create a user to begin</p>

      <Link href="/users">
        <button className="px-6 py-3 bg-[#C170FF] text-white font-semibold rounded-full shadow hover:brightness-110">
          Go to Users Page
        </button>
      </Link>
    </main>
  );
}
