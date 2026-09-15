'use client';

import Sidebar from '../organisms/Sidebar';

/**
 * TEMPLATE — DashboardLayout
 * Sidebar + scrollable main column. Holds no data of its own.
 * Below 760px the two stack, with the sidebar becoming a sticky header.
 */
export default function DashboardLayout({
  user,
  activeTab,
  onTabChange,
  onLogout,
  children,
}) {
  return (
    <div className="flex min-h-screen max-[760px]:flex-col">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
      />
      <main className="min-w-0 flex-1 px-[30px] pb-12 pt-[26px] max-[980px]:px-[18px] max-[980px]:pb-10 max-[980px]:pt-[22px]">
        {children}
      </main>
    </div>
  );
}
