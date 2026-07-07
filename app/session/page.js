'use client';
import { Suspense } from 'react';
import SessionPage from './session';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SessionPage />
    </Suspense>
  );
}
