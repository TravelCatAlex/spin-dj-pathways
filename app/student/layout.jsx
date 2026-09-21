'use client';

import { usePathname, useRouter } from 'next/navigation';

import DashboardLayout from '../components/templates/DashboardLayout';
import { LiveDashboardProvider, useLive } from '../lib/live-context';

/**
 * Tab id → route. The Sidebar still speaks in the tab ids from NAV_ITEMS, so
 * the translation lives here and nothing below the layout has to know a
 * router exists. That is what keeps Sidebar, NavItem and the mobile drawer
 * untouched by the move to real routes.
 *
 * `profile` is in the table although it is not in NAV_ITEMS — the profile
 * block at the foot of the rail opens it, and it needs an address like
 * every other view.
 */
const TAB_PATH = {
  home: '/student',
  projects: '/student/projects',
  creations: '/student/creations',
  pathway: '/student/pathway',
  events: '/student/events',
  profile: '/student/profile',
};

function Shell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const live = useLive();

  // Derived from the URL, never stored. A tab held in state and a URL are two
  // sources for one fact, and they disagree the moment the back button is
  // pressed — which is exactly what the old activeTab state did.
  const activeTab =
    Object.keys(TAB_PATH).find((id) => TAB_PATH[id] === pathname) ?? 'home';

  return (
    <DashboardLayout
      user={live.user}
      loading={live.loading}
      activeTab={activeTab}
      onTabChange={(id) => router.push(TAB_PATH[id] ?? TAB_PATH.home)}
      onLogout={() => router.push('/login')}
      onProfileClick={() => router.push(TAB_PATH.profile)}
    >
      {children}
    </DashboardLayout>
  );
}

/**
 * LAYOUT — /student
 * Sidebar and the student's data, held across every tab in the section.
 * Next keeps a layout mounted while you navigate within it, so the fetch in
 * LiveDashboardProvider runs once rather than once per tab.
 */
export default function StudentLayout({ children }) {
  return (
    <LiveDashboardProvider>
      <Shell>{children}</Shell>
    </LiveDashboardProvider>
  );
}
