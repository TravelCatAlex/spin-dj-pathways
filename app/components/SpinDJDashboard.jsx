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
      <div className="role-screen">
        <div>
          <div className="role-screen__brand">
            <Logo width={260} priority className="role-screen__logo" />
          </div>
          <p className="role-screen__sub">Select your role to continue</p>
          <div className="role-screen__options">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                className="role-screen__btn"
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
    <div className="shell__main">
      <h1 className="stub__title">
        {role === 'teacher' ? 'Teacher' : 'Organization'} Dashboard
      </h1>
      <div className="stub" style={{ marginBottom: '20px' }}>
        Coming soon
      </div>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => setRole(null)}
      >
        Change Role
      </button>
    </div>
  );
}
