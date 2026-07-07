'use client';
import { Suspense } from 'react';
import UserPage from './user';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <UserPage />
    </Suspense>
  );
}
