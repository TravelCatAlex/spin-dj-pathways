'use client';

import { useRouter } from 'next/navigation';

/**
 * PAGE — teacher and organization.
 * Neither role has a dashboard yet, so both get the same honest panel and a
 * way back to the gate. Sidebar is deliberately absent: its nav is the
 * student's, and showing it here would offer five tabs that do not exist for
 * this role.
 */
export default function RoleComingSoonPage({ role }) {
  const router = useRouter();

  return (
    <div className="min-w-0 flex-1 px-[30px] pb-12 pt-[26px] max-[980px]:px-[18px] max-[980px]:pb-10 max-[980px]:pt-[22px]">
      <h1 className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        {role} Dashboard
      </h1>
      <div className="mb-5 rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
        Coming soon
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-transparent bg-purple px-[15px] py-[9px] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.26)] transition-[transform,background-color] duration-150 ease-out hover:bg-purple-600 active:translate-y-px"
        onClick={() => router.push('/login')}
      >
        Change Role
      </button>
    </div>
  );
}
