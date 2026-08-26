// Save this as: app/dashboard/page.jsx

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import to avoid SSR issues
const SpinDJDashboard = dynamic(() => import('@/app/components/SpinDJDashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#FFA500',
        fontSize: '1.2rem',
      }}
    >
      Loading Dashboard...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpinDJDashboard />
    </Suspense>
  );
}
