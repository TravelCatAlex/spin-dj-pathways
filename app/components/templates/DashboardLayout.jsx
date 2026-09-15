'use client';

import Sidebar from '../organisms/Sidebar';

/**
 * TEMPLATE — DashboardLayout
 * Sidebar + scrollable main column. Holds no data of its own.
 */
export default function DashboardLayout({
  user,
  activeTab,
  onTabChange,
  onLogout,
  children,
}) {
  return (
    <div className="shell">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />
      <main className="shell__main">{children}</main>
    </div>
  );
}
