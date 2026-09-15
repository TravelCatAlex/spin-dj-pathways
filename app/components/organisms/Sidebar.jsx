'use client';

import { useEffect, useState } from 'react';

import NavItem from '../molecules/NavItem';
import Avatar from '../atoms/Avatar';
import MenuToggle from '../atoms/MenuToggle';
import { NAV_ITEMS } from '../../lib/fixtures';

const DRAWER_ID = 'sidebar-drawer';

/**
 * ORGANISM — Sidebar
 * Brand, primary navigation, profile block and logout.
 *
 * Desktop: a fixed left rail — the drawer is `display: contents`, so nav and
 * footer stay direct flex children of the rail.
 * Mobile: collapses to a header row with a hamburger that opens the drawer.
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
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <p className="sidebar__logo">
            SPIN<span aria-hidden="true">DJ</span>
            <br />
            PATHWAYS
          </p>
          <p className="sidebar__user-hint">{user.firstName}</p>
        </div>

        <MenuToggle
          open={menuOpen}
          controls={DRAWER_ID}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </div>

      <div
        id={DRAWER_ID}
        className={`sidebar__drawer${menuOpen ? ' sidebar__drawer--open' : ''}`}
      >
        <nav className="sidebar__nav" aria-label="Main">
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

        <div className="sidebar__footer">
          <div className="sidebar__profile">
            <Avatar name={user.firstName} src={user.avatarUrl} />
            <div>
              <p className="sidebar__profile-name">{user.firstName}</p>
              <p className="sidebar__profile-role">{user.role}</p>
            </div>
          </div>
          <button type="button" className="sidebar__logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
