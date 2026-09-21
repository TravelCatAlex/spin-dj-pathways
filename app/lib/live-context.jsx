'use client';

import { createContext, useContext } from 'react';

import { useLiveDashboard } from './live-data';

/**
 * ONE dashboard fetch for the whole student section.
 *
 * Before routing, `useLiveDashboard()` was called once in StudentDashboardPage
 * and every tab was a branch inside it. Each tab is now its own route, and
 * calling the hook in each page would refetch the student on every navigation
 * — the sidebar's name and avatar would blink back to their skeletons each
 * time you changed tab.
 *
 * The provider lives in the student LAYOUT, which Next keeps mounted across
 * navigations within the section. So the fetch happens once, on entering the
 * section, and every page reads the same state.
 */
const LiveDashboardContext = createContext(null);

export function LiveDashboardProvider({ children }) {
  const live = useLiveDashboard();
  return (
    <LiveDashboardContext.Provider value={live}>{children}</LiveDashboardContext.Provider>
  );
}

export function useLive() {
  const live = useContext(LiveDashboardContext);
  // Throws rather than handing back a plausible empty object: a page rendered
  // outside the provider would otherwise show fixtures forever and look like
  // a data bug rather than the wiring mistake it is.
  if (live === null) {
    throw new Error('useLive must be used inside <LiveDashboardProvider>');
  }
  return live;
}
