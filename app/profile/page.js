// app/profile/page.js
'use client';
import { Suspense } from 'react';
import Profile from './profile';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Profile />
    </Suspense>
  );
}
