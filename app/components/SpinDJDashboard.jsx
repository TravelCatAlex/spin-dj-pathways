'use client';

import { useState } from 'react';
import Logo from './atoms/Logo';
import StudentDashboardPage from './pages/StudentDashboardPage';

const ROLES = ['student', 'teacher', 'organization'];

/**
 * Role gate. Student resolves to the full dashboard; the other roles are
 * out of scope for this milestone.
 */
export default function SpinDJDashboard() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#faf8ff_0%,#ebe0ff_100%)] p-8 text-center text-ink">
        <div>
          {/* The logo is transparent and the screen is light, so it needs no
              backing panel — that only existed for the old dark background. */}
          <Logo width={260} priority className="mx-auto mb-[26px]" />
          <p className="m-0 mb-9 text-ink-soft">Select your role to continue</p>
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                className="rounded-[10px] border-0 bg-purple px-[26px] py-[13px] font-bold capitalize text-white transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-purple-600"
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role === 'student') {
    return <StudentDashboardPage onLogout={() => setRole(null)} />;
  }

  return (
    <div className="min-w-0 flex-1 px-[30px] pb-12 pt-[26px] max-[980px]:px-[18px] max-[980px]:pb-10 max-[980px]:pt-[22px]">
      <h1 className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        {role === 'teacher' ? 'Teacher' : 'Organization'} Dashboard
      </h1>
      <div className="mb-5 rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
        Coming soon
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-transparent bg-purple px-[15px] py-[9px] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.26)] transition-[transform,background-color] duration-150 ease-out hover:bg-purple-600 active:translate-y-px"
        onClick={() => setRole(null)}
      >
        Change Role
      </button>
    </div>
  );
}
