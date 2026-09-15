'use client';

import { useEffect, useState } from 'react';

import NavItem from '../molecules/NavItem';
import Avatar from '../atoms/Avatar';
import MenuToggle from '../atoms/MenuToggle';
import Icon from '../atoms/Icon';
import Logo from '../atoms/Logo';
import { NAV_ITEMS } from '../../lib/fixtures';

const DRAWER_ID = 'sidebar-drawer';

/**
 * ORGANISM — Sidebar
 * Light rail with brand, primary navigation, profile block and logout.
 *
 * Desktop: the drawer is `display: contents`, so nav and footer stay direct
 * flex children of the rail and the footer can sit at the bottom.
 * Mobile (<=760px): collapses to a sticky header row with a hamburger.
 */
export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleTabChange = (id) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar flex-[0_0_var(--spacing-sidebar)] flex-col overflow-hidden border-r border-line bg-surface px-3.5 pb-[18px] pt-[22px] max-[760px]:z-20 max-[760px]:block max-[760px]:h-auto max-[760px]:w-full max-[760px]:flex-none max-[760px]:border-b max-[760px]:border-b-line max-[760px]:border-r-0 max-[760px]:px-4 max-[760px]:py-2.5">
      {/* Soft lavender wash filling the foot of the rail. It is a wide ellipse
          pushed past both edges, so only its top arc crosses the rail — that
          arc is the curved boundary behind the profile block. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-32%] bottom-[-140px] h-[420px] -rotate-3 rounded-[50%] bg-[linear-gradient(180deg,#dcd0f9_0%,#ece5fd_60%,#f1ecfe_100%)] max-[760px]:hidden"
      />

      <div className="max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3">
        <div className="mb-[22px] px-1.5 max-[760px]:mb-0 max-[760px]:p-0">
          <Logo width={150} priority className="max-[760px]:!w-[118px]" />
        </div>

        <MenuToggle
          open={menuOpen}
          controls={DRAWER_ID}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </div>

      <div
        id={DRAWER_ID}
        className={`contents ${
          menuOpen
            ? 'max-[760px]:block max-[760px]:animate-drawer-in max-[760px]:pt-3 motion-reduce:animate-none'
            : 'max-[760px]:hidden'
        }`}
      >
        <nav className="flex flex-col gap-[3px]" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
            />
          ))}
        </nav>

        {/* No divider rule: the wash's curved edge does that job on desktop,
            so the hairline only comes back once the wash is hidden. */}
        <div className="relative z-[1] mt-auto pt-4 max-[760px]:mt-3 max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3 max-[760px]:border-t max-[760px]:border-line">
          <div className="mb-2 flex items-center gap-[9px] px-1.5 py-1 max-[760px]:mb-0">
            <Avatar name={user.firstName} src={user.avatarUrl} size={34} ring />
            <div>
              <p className="m-0 text-[13px] font-bold">{user.firstName}</p>
              <p className="m-0 text-[11.5px] text-muted">{user.role}</p>
            </div>
            <span className="ml-auto text-[11px] text-muted max-[760px]:hidden">
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[10px] border border-transparent bg-transparent px-3 py-[9px] text-[13px] text-ink-soft transition-colors duration-150 ease-out hover:text-purple max-[760px]:w-auto max-[760px]:border-line max-[760px]:bg-surface"
            onClick={onLogout}
          >
            <Icon name="logout" /> Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
