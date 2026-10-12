'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import DashboardLayout from '../components/templates/DashboardLayout';

/**
 * The teacher's dashboard shell - the student's layout, with the teacher's nav.
 *
 * It reuses DashboardLayout (sidebar + scrollable main, responsive to a sticky
 * header under 760px) so the two roles share one rail and cannot drift apart. The
 * nav is the one thing that differs: Private Notes and Public Notes instead of the
 * student's sections.
 *
 * ONE ROSTER FETCH FEEDS THREE THINGS: the greeting (the teacher's name), the
 * profile block at the foot of the rail, and the Public-note student picker. It is
 * `/api/v1/teachers/me/roster`, which carries the viewer's JWT, so migration 0055's
 * policies decide what comes back - there is no id to pass.
 *
 * The active view is state here, not a route: the teacher's two views are the same
 * page with a different list, so a query param or a second route would be a URL for
 * a filter. The sidebar switches it; `page.jsx` reads it from context.
 */

const TEACHER_NAV = [
  { id: 'private', label: 'Private Notes', icon: 'note' },
  { id: 'public', label: 'Public Notes', icon: 'users' },
];

const TeacherLiveContext = createContext(null);

export function useTeacherLive() {
  const live = useContext(TeacherLiveContext);
  if (live === null) {
    throw new Error('useTeacherLive must be used inside <TeacherShell>');
  }
  return live;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TeacherShell({ children }) {
  const router = useRouter();

  const [view, setView] = useState('private');
  const [state, setState] = useState({
    loading: true,
    user: { firstName: '', lastName: '', role: 'Teacher', avatarUrl: null },
    students: [],
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/v1/teachers/me/roster');
        if (response.status === 401) {
          window.location.assign('/login');
          return;
        }
        const body = await response.json();
        if (cancelled || !response.ok) {
          if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
          return;
        }
        // The roster returns one full name. Split only to feed the greeting and
        // the avatar initial - the rest of the name rides along as lastName.
        const name = body.teacher?.name ?? '';
        const [firstName, ...rest] = name.split(' ');
        setState({
          loading: false,
          user: {
            firstName: firstName ?? '',
            lastName: rest.join(' '),
            role: 'Teacher',
            avatarUrl: null,
          },
          students: body.students ?? [],
        });
      } catch {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A real sign-out - the same shape the student shell uses. POST so no <img>
  // can fire it; the local navigation happens whether or not the request did.
  async function signOut() {
    try {
      await fetch('/auth/signout', { method: 'POST' });
    } catch {
      // Deliberately swallowed - see StudentShell.
    }
    router.replace('/login');
    router.refresh();
  }

  const value = {
    user: state.user,
    loading: state.loading,
    students: state.students,
    dateLabel: todayLabel(),
    view,
  };

  return (
    <TeacherLiveContext.Provider value={value}>
      <DashboardLayout
        user={state.user}
        loading={state.loading}
        navItems={TEACHER_NAV}
        activeTab={view}
        // The logo sends you 'home'; a teacher's home is their first view.
        onTabChange={(id) => setView(id === 'home' ? 'private' : id)}
        onLogout={signOut}
        // No teacher profile page yet; the block still shows who is signed in.
        onProfileClick={() => {}}
      >
        {children}
      </DashboardLayout>
    </TeacherLiveContext.Provider>
  );
}
