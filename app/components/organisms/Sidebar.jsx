'use client';

import { useEffect, useRef, useState } from 'react';

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
export default function Sidebar({ user, activeTab, onTabChange, onLogout, onProfileClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const railRef = useRef(null);

  // Escape, or a press anywhere outside the rail, closes the mobile dropdown —
  // what anyone expects of a menu that floats over the page.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    const onPointerDown = (e) => {
      if (!railRef.current?.contains(e.target)) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const handleTabChange = (id) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    setMenuOpen(false);
  };

  return (
    <aside
      ref={railRef}
      className="sticky top-0 flex h-screen w-sidebar flex-[0_0_var(--spacing-sidebar)] flex-col overflow-hidden border-r border-line bg-surface px-3.5 pb-[18px] pt-[22px] max-[760px]:z-30 max-[760px]:block max-[760px]:h-auto max-[760px]:w-full max-[760px]:flex-none max-[760px]:overflow-visible max-[760px]:border-b max-[760px]:border-b-line max-[760px]:border-r-0 max-[760px]:px-4 max-[760px]:py-2.5"
    >
      {/* Soft lavender wash filling the foot of the rail. The crest is a drawn
          wave rather than an ellipse arc, so it reads as one gentle S across
          the full width instead of a dome rising out of the left edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[230px] max-[760px]:hidden"
      >
        <svg
          viewBox="0 0 216 230"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="sidebar-wash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dcd0f9" />
              <stop offset="60%" stopColor="#ece5fd" />
              <stop offset="100%" stopColor="#f1ecfe" />
            </linearGradient>
          </defs>
          <path
            d="M0 46 C 54 6, 108 74, 162 40 C 184 26, 202 22, 216 26 L216 230 L0 230 Z"
            fill="url(#sidebar-wash)"
          />
        </svg>
      </div>

      <div className="max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3">
        {/* The wordmark returns to Home, the way a site logo is expected to. */}
        <button
          type="button"
          onClick={() => handleTabChange('home')}
          aria-label="Spin DJ Pathways — go to Home"
          className="mb-[22px] block cursor-pointer rounded-[10px] border-0 bg-transparent px-1.5 transition-opacity duration-150 ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple max-[760px]:mb-0 max-[760px]:p-0"
        >
          <Logo width={150} priority className="max-[760px]:!w-[118px]" />
        </button>

        <MenuToggle
          open={menuOpen}
          controls={DRAWER_ID}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </div>

      <div
        id={DRAWER_ID}
        /* Mobile: a dropdown anchored under the header bar — absolute, so it
           floats over the page instead of pushing the dashboard down. */
        className={`contents ${
          menuOpen
            ? 'max-[760px]:absolute max-[760px]:inset-x-0 max-[760px]:top-full max-[760px]:z-30 max-[760px]:block max-[760px]:animate-drawer-in max-[760px]:rounded-b-lg max-[760px]:border-b max-[760px]:border-line max-[760px]:bg-surface max-[760px]:p-4 max-[760px]:shadow-[0_18px_40px_rgba(20,18,31,0.16)] motion-reduce:animate-none'
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
        <div className="relative z-[1] mt-auto pt-9 max-[760px]:mt-3 max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3 max-[760px]:border-t max-[760px]:border-line max-[760px]:pt-3">
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label={`${user.firstName}, ${user.role} — open profile`}
            className="mb-3 flex w-full items-center gap-[11px] rounded-[10px] border-0 bg-transparent px-1.5 py-1 text-left transition-colors duration-150 ease-out hover:bg-purple-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple max-[760px]:mb-0 max-[760px]:w-auto"
          >
            <Avatar name={user.firstName} src={user.avatarUrl} size={38} ring />
            {/* Spans, not divs: a button may only contain phrasing content, and
                a div inside one breaks hydration. */}
            <span className="block">
              <span className="block text-[13px] font-bold">{user.firstName}</span>
              <span className="block text-[11.5px] text-muted">{user.role}</span>
            </span>
            <span className="ml-auto text-[11px] text-muted max-[760px]:hidden">
              <Icon name="chevronDown" size={14} />
            </span>
          </button>
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
