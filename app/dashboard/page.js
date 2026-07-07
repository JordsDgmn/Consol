'use client';
import { Suspense } from 'react';
import Dashboard from './dashboard';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
