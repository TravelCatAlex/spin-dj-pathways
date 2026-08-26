so the entire page.jsx file should be just:

'use client';
import SpinDJDashboard from '@/app/components/SpinDJDashboard';
export default function DashboardPage() {
  return <SpinDJDashboard />;
}
